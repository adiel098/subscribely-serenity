
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No URL provided' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Proxying image request for: ${imageUrl}`);

    // Get bot token from environment variable
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
      return new Response(JSON.stringify({ error: 'Bot token not configured' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the image from Telegram
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bot ${botToken}`
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch image', 
        status: response.status,
        statusText: response.statusText
      }), { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the image data and content type
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with appropriate headers
    return new Response(imageData, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });

  } catch (error) {
    console.error('Error in telegram-image-proxy:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
