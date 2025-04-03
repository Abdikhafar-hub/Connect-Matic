
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

// This function is meant to be triggered as a scheduled task or cron job
Deno.serve(async (req) => {
  try {
    // Only allow POST requests for this task
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Only POST requests are allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }

    // Get SMTP credentials from environment variables
    const host = Deno.env.get('SMTP_HOST');
    const port = parseInt(Deno.env.get('SMTP_PORT') || "587");
    const secure = Deno.env.get('SMTP_SECURE') === 'true';
    const user = Deno.env.get('SMTP_USER');
    const password = Deno.env.get('SMTP_PASSWORD');
    const from = Deno.env.get('SMTP_FROM');
    
    if (!host || !user || !password || !from) {
      throw new Error('Missing SMTP configuration');
    }
    
    // Initialize SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: secure,
        auth: {
          username: user,
          password: password,
        },
      },
    });
    
    // Initialize Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the current time
    const now = new Date();
    
    // Find emails that are scheduled to be sent now or earlier
    const { data: scheduledEmails, error: emailError } = await supabase
      .from("follow_up_emails")
      .select("*, contacts(full_name, email)")
      .eq("status", "scheduled")
      .lte("scheduled_for", now.toISOString());
    
    if (emailError) {
      throw new Error(`Failed to fetch scheduled emails: ${emailError.message}`);
    }
    
    console.log(`Found ${scheduledEmails?.length || 0} emails to send`);
    
    // Process each email
    const results = [];
    
    if (scheduledEmails && scheduledEmails.length > 0) {
      for (const email of scheduledEmails) {
        try {
          // Skip if contact doesn't have an email address
          if (!email.contacts?.email) {
            console.warn(`Contact ${email.contact_id} has no email address`);
            
            // Mark as failed
            await supabase
              .from("follow_up_emails")
              .update({ status: "failed", sent_at: now.toISOString() })
              .eq("id", email.id);
              
            results.push({
              id: email.id,
              status: "failed",
              reason: "Missing recipient email address"
            });
            
            continue;
          }
          
          // Send email
          await client.send({
            from: from,
            to: email.contacts.email,
            subject: email.subject,
            content: email.content,
            html: email.content
          });
          
          // Update the email status
          await supabase
            .from("follow_up_emails")
            .update({ status: "sent", sent_at: now.toISOString() })
            .eq("id", email.id);
            
          results.push({
            id: email.id,
            status: "sent",
            contact: email.contacts.full_name,
            email: email.contacts.email
          });
          
          console.log(`Email sent to ${email.contacts.email}`);
        } catch (error) {
          console.error(`Failed to send email ${email.id}:`, error);
          
          // Mark as failed
          await supabase
            .from("follow_up_emails")
            .update({ status: "failed" })
            .eq("id", email.id);
            
          results.push({
            id: email.id,
            status: "failed",
            error: error.message
          });
        }
      }
    }
    
    // Close SMTP connection
    await client.close();
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending scheduled emails:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
