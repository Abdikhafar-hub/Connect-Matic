import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  imageUrl: string;
  userId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Log all environment variables (for debugging purposes)
    console.log("All environment variables:", Deno.env.toObject());
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyByXeLYrBa200OFd-mIBNaOaygvlYuabMU'; // Replace with your actual API key (temporary for debugging)
    console.log("Gemini API Key:", geminiApiKey ? `Set (starts with: ${geminiApiKey.slice(0, 5)}...)` : "Not Set");
    
    if (!geminiApiKey) {
      throw new Error('Missing Gemini API key');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log("Supabase URL:", supabaseUrl ? "Set" : "Not Set");
    console.log("Supabase Service Key:", supabaseServiceKey ? "Set" : "Not Set");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const requestData = await req.json();
    const { imageUrl, userId } = requestData as RequestBody;
    
    if (!imageUrl) {
      throw new Error('Missing image URL');
    }
    
    if (!userId) {
      throw new Error('Missing user ID');
    }

    console.log("Processing image URL:", imageUrl);
    
    const imagePath = imageUrl.replace(`${supabaseUrl}/storage/v1/object/public/business_cards/`, '');
    console.log("Image path:", imagePath);

    const { data: imageData, error: imageError } = await supabase
      .storage
      .from('business_cards')
      .download(imagePath);

    if (imageError) {
      throw new Error(`Failed to fetch image: ${imageError.message}`);
    }
    
    if (!imageData) {
      throw new Error('No image data received from storage');
    }
    
    const base64Image = await imageData.arrayBuffer();
    const encodedImage = btoa(
      new Uint8Array(base64Image)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Call Google Gemini API for text extraction
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "image/png",
                    data: encodedImage,
                  },
                },
                {
                  text: "Extract the text from this business card image and format it as a JSON object with the following fields: full_name, email, phone, company, position, website. If a field is not found, set it to null."
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API request failed with status ${geminiResponse.status}: ${errorText}`);
    }

    const geminiResult = await geminiResponse.json();
    let extractedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

    if (extractedText?.startsWith("```json\n") && extractedText?.endsWith("\n```")) {
      extractedText = extractedText.slice(7, -4);
    }

    if (!extractedText) {
      throw new Error('No text extracted from the image by Gemini API');
    }

    console.log("Extracted text:", extractedText);

    // Parse the extracted text as JSON
    let contactData;
    try {
      contactData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini API response as JSON:", parseError);
      throw new Error('Failed to parse extracted text as JSON');
    }

    // Validate the extracted data
    const expectedFields = ['full_name', 'email', 'phone', 'company', 'position', 'website'];
    const validatedContactData = {};
    for (const field of expectedFields) {
      validatedContactData[field] = contactData[field] !== undefined ? contactData[field] : null;
    }

    const contactWithUserId = {
      ...validatedContactData,
      user_id: userId,
      card_image_url: imageUrl,
    };

    console.log("Saving contact data:", contactWithUserId);

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
        extraction: validatedContactData,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: error.message === 'Missing image URL' || error.message === 'Missing user ID' ? 400 : 500
      }
    );
  }
});