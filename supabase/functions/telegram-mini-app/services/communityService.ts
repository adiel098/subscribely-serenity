
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { fetchCommunityData } from "./community/fetchService.ts";
import { processCommunityData } from "./community/processService.ts";

// Re-export functions from modules for backward compatibility
export { fetchCommunityData, processCommunityData };
