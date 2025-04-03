
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  contactName: string;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
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
    
    const { to, subject, body, contactName, userId } = await req.json() as EmailRequest;
    
    if (!to || !subject || !body) {
      throw new Error('Missing required email fields');
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

    // Send the email
    await client.send({
      from: from,
      to: to,
      subject: subject,
      content: body,
      html: body,
    });
    
    // Close the connection
    await client.close();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent to ${contactName}` 
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
