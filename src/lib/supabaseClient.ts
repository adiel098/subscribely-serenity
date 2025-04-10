
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://trkiniaqliiwdkrvvuky.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2luaWFxbGlpd2RrcnZ2dWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDUzMTMsImV4cCI6MjA1NTI4MTMxM30.3BYeVu2QCUT7LozpFWCgcP9zSfLA7v3FzO_6n6nZzM0";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Using fallback values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
