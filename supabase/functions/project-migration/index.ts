
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Initialize the Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Get JWT token from the auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authorization header is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create a new project if the user doesn't have one
    const { data: existingProjects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1);

    if (projectsError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to check existing projects: ' + projectsError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    let projectId;
    
    if (!existingProjects || existingProjects.length === 0) {
      // Create a default project
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          name: 'My Project',
          description: 'Default project created during migration',
          owner_id: user.id,
          is_custom_bot: false,
        })
        .select('id')
        .single();

      if (createError) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to create default project: ' + createError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      projectId = newProject.id;
      console.log(`Created new project: ${projectId}`);
    } else {
      projectId = existingProjects[0].id;
      console.log(`Using existing project: ${projectId}`);
    }

    // Migrate communities that don't have a project_id yet
    const { data: communities, error: commError } = await supabase
      .from('communities')
      .select('id')
      .eq('owner_id', user.id)
      .is('project_id', null);

    if (commError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch communities: ' + commError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (communities && communities.length > 0) {
      const communityIds = communities.map(c => c.id);
      console.log(`Migrating ${communityIds.length} communities to project ${projectId}`);
      
      // Update all communities with the project ID
      const { error: updateError } = await supabase
        .from('communities')
        .update({ project_id: projectId })
        .in('id', communityIds);

      if (updateError) {
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update communities: ' + updateError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Migration completed successfully',
        projectId,
        communitiesMigrated: communities?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in project-migration function:', error);
    
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
