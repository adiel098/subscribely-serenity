
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://trkiniaqliiwdkrvvuky.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya2luaWFxbGlpd2RrcnZ2dWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MDUzMTMsImV4cCI6MjA1NTI4MTMxM30.3BYeVu2QCUT7LozpFWCgcP9zSfLA7v3FzO_6n6nZzM0";

// Import the supabase client like this:ד
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
