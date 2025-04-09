
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const migrateToProjectStructure = async (): Promise<{ success: boolean; projectId?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke("project-migration");
    
    if (error) {
      console.error("Migration error:", error);
      toast.error("Failed to migrate to project structure");
      return { success: false };
    }
    
    if (data.success) {
      toast.success("Migration completed successfully");
      return { success: true, projectId: data.projectId };
    } else {
      toast.error(data.message || "Migration failed");
      return { success: false };
    }
  } catch (error) {
    console.error("Migration exception:", error);
    toast.error("An unexpected error occurred during migration");
    return { success: false };
  }
};
