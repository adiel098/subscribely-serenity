import { supabase } from '@/lib/supabaseClient';
import logger from '@/utils/logger';

export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    logger.error('Error fetching projects:', err);
    throw err;
  }
}

// Additional project-related functions can be added here
