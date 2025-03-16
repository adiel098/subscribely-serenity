
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the URL parameter from the request
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Log the request for debugging
    console.log(`Proxying request for: ${imageUrl}`);
    
    // Get the bot token from the environment
    const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
    
    if (!token) {
      console.error('TELEGRAM_BOT_TOKEN not found in environment');
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Make a request to the image URL
    const response = await fetch(imageUrl, {
      headers: {
        // Add auth header if it's a Telegram URL
        ...(imageUrl.includes('telegram.org') ? {
          'Authorization': `Bot ${token}`
        } : {})
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching image: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch image', 
          status: response.status, 
          statusText: response.statusText 
        }),
        { 
          status: response.status, 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Get the image data and content type
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return the image data
    return new Response(imageData, { 
      headers: { 
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      } 
    });
  } catch (error) {
    console.error('Error in telegram-image-proxy:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
