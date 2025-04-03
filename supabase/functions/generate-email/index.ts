
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  contactId: string;
  notes: string;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { contactId, notes, userId } = await req.json() as RequestBody;
    
    if (!contactId) {
      throw new Error('Missing contact ID');
    }
    
    if (!userId) {
      throw new Error('Missing user ID');
    }

    // Get the contact details
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .eq('user_id', userId)
      .single();

    if (contactError) {
      throw new Error(`Failed to fetch contact: ${contactError.message}`);
    }

    // Get any existing notes for this contact
    const { data: existingNotes, error: notesError } = await supabase
      .from('synergy_notes')
      .select('notes')
      .eq('contact_id', contactId)
      .maybeSingle();

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(`Failed to fetch user data: ${userError.message}`);
    }

    // Combine notes
    let allNotes = notes || "";
    if (existingNotes?.notes) {
      allNotes = `${existingNotes.notes}\n\n${allNotes}`;
    }

    // Generate email with GPT-4
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert at writing personalized, professional follow-up emails based on networking contacts and conversation notes. Write in a friendly, professional tone. Focus on building genuine connections. Do not add any explanations - just write the email text."
          },
          {
            role: "user",
            content: `Write a follow-up email to ${contact.full_name} who works at ${contact.company || "their company"} as a ${contact.position || "professional"}. 
            I want to follow up based on these notes from our conversation: "${allNotes}"
            
            My name is ${userData.full_name || "the sender"}.
            
            Write a complete, personalized email that references our conversation, reinforces connections we discovered, and suggests a next step.`
          }
        ],
        max_tokens: 1000
      })
    });

    const result = await response.json();
    const emailContent = result.choices[0].message.content;
    
    // Save the new notes if they were provided
    if (notes) {
      if (existingNotes) {
        // Update existing notes
        await supabase
          .from('synergy_notes')
          .update({ notes: allNotes })
          .eq('contact_id', contactId);
      } else {
        // Create new notes
        await supabase
          .from('synergy_notes')
          .insert({ contact_id: contactId, notes: allNotes });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: emailContent
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error(error);
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
