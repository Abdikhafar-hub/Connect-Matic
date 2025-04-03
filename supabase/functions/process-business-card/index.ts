// Follow this setup guide to integrate the Deno runtime for your Supabase Edge Function
// https://deno.land/manual@v1.37.0/runtime/supabase

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  imageUrl: string;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Get and validate OpenAI API key
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.error("Missing OpenAI API key");
      throw new Error('Missing OpenAI API key');
    }

    console.log("OpenAI API Key is configured");

    // Get and validate Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      throw new Error('Missing Supabase configuration');
    }

    console.log("Supabase configuration is valid");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    const { imageUrl, userId } = requestData;
    
    if (!imageUrl) {
      throw new Error('Missing image URL');
    }
    
    if (!userId) {
      throw new Error('Missing user ID');
    }

    console.log("Processing image URL:", imageUrl);
    
    // Get the image from Supabase Storage
    const imagePath = imageUrl.replace(`${supabaseUrl}/storage/v1/object/public/business_cards/`, '');
    console.log("Image path:", imagePath);

    const { data: imageData, error: imageError } = await supabase
      .storage
      .from('business_cards')
      .download(imagePath);

    if (imageError) {
      console.error("Failed to fetch image:", imageError);
      throw new Error(`Failed to fetch image: ${imageError.message}`);
    }
    
    if (!imageData) {
      console.error("No image data received from storage");
      throw new Error('No image data received from storage');
    }
    
    // Convert image to base64
    const base64Image = await imageData.arrayBuffer();
    const encodedImage = btoa(
      new Uint8Array(base64Image)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    console.log("Image converted to base64, sending to OpenAI API");

    // Process image with OpenAI Vision API
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert at extracting contact information from business cards. Extract the following fields if present: full_name, email, phone, company, position, website. Return the data as a JSON object with these fields. Do not include any other text in your response."
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${encodedImage}`
                  }
                },
                {
                  type: "text",
                  text: "Extract the contact information from this business card and provide it as JSON."
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error("OpenAI API error:", openAIResponse.status, errorText);
        throw new Error(`OpenAI API returned error: ${openAIResponse.status} ${errorText}`);
      }

      const result = await openAIResponse.json();
      
      // Check if we have a valid response with choices
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        console.error("Unexpected API response format:", JSON.stringify(result));
        throw new Error('Invalid response from OpenAI API');
      }
      
      const extraction = result.choices[0].message.content;
      console.log("Extracted content:", extraction);
      
      // Parse the JSON response
      let contactData;
      try {
        contactData = JSON.parse(extraction);
      } catch (error) {
        console.log("Failed to parse JSON, using regex extraction instead");
        // If parsing fails, extract using regex
        const nameMatch = extraction.match(/["']?full_?name["']?\s*:\s*["']([^"']+)["']/i);
        const emailMatch = extraction.match(/["']?email["']?\s*:\s*["']([^"']+)["']/i);
        const phoneMatch = extraction.match(/["']?phone["']?\s*:\s*["']([^"']+)["']/i);
        const companyMatch = extraction.match(/["']?company["']?\s*:\s*["']([^"']+)["']/i);
        const positionMatch = extraction.match(/["']?position["']?\s*:\s*["']([^"']+)["']/i);
        const websiteMatch = extraction.match(/["']?website["']?\s*:\s*["']([^"']+)["']/i);

        contactData = {
          full_name: nameMatch ? nameMatch[1] : null,
          email: emailMatch ? emailMatch[1] : null,
          phone: phoneMatch ? phoneMatch[1] : null,
          company: companyMatch ? companyMatch[1] : null, 
          position: positionMatch ? positionMatch[1] : null,
          website: websiteMatch ? websiteMatch[1] : null,
        };
      }
      
      // Add the userId
      const contactWithUserId = {
        ...contactData,
        user_id: userId,
        card_image_url: imageUrl
      };

      console.log("Saving contact data:", contactWithUserId);

      // Save to database
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactWithUserId)
        .select();

      if (error) {
        console.error("Database insertion error:", error);
        throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Contact successfully extracted and saved",
          contact: data && data.length > 0 ? data[0] : null,
          extraction: contactData
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    } catch (apiError) {
      console.error("OpenAI API error:", apiError);
      throw new Error(`OpenAI API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
