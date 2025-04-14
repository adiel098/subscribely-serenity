
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/auth/contexts/AuthContext";
import { TelegramChat } from "@/group_owners/components/onboarding/custom-bot/TelegramChatItem";

export interface CreateCommunityGroupData {
  name: string;
  description?: string;
  custom_link?: string;
  communities?: TelegramChat[];
  bot_token?: string | null;
}

// Create a temporary storage for onboarding data
const onboardingTempData: {
  project?: CreateCommunityGroupData;
} = {};

export const getTempOnboardingData = () => onboardingTempData;
export const setTempProjectData = (data: CreateCommunityGroupData) => {
  onboardingTempData.project = data;
  console.log("Temporary project data saved:", data);
  return true;
};

export const useCreateCommunityGroup = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCommunityGroupData) => {
      console.log("Creating new project:", data);
      
      if (!user) {
        throw new Error("User is not authenticated");
      }
      
      try {
        // Check if a project with this bot token already exists
        if (data.bot_token) {
          const { data: existingProject } = await supabase
            .from("projects")
            .select("id, name")
            .eq("bot_token", data.bot_token)
            .single();

          if (existingProject) {
            throw new Error(`A project with this bot token already exists: ${existingProject.name}`);
          }
        }
        
        // Insert into projects table
        const { data: newProject, error } = await supabase
          .from("projects")
          .insert({
            name: data.name,
            description: data.description || null,
            owner_id: user.id,
            bot_token: data.bot_token || null
          })
          .select("*")
          .single();
        
        if (error) {
          console.error("Error creating project:", error);
          throw error;
        }
        
        if (!newProject) {
          throw new Error("Failed to create project");
        }

        console.log("✅ Project created successfully:", {
          projectId: newProject.id,
          name: newProject.name,
          botTokenSet: !!data.bot_token
        });
        
        // Note: We don't need to manually create bot settings anymore
        // as they're created automatically by database trigger
        
        // Create communities if any
        if (data.communities && data.communities.length > 0) {
          // Add a delay before creating communities to ensure project is fully saved
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Create communities in batches of 5 to avoid overloading the database
          const batchSize = 5;
          let successCount = 0;
          
          for (let i = 0; i < data.communities.length; i += batchSize) {
            const batch = data.communities.slice(i, i + batchSize);
            const communitiesData = batch.map(chat => ({
              project_id: newProject.id,
              telegram_chat_id: chat.id,
              owner_id: user.id,
              name: chat.title,
              description: chat.description || null,
              telegram_photo_url: chat.photo_url || null
            }));

            try {
              const { data: createdCommunities, error: communitiesError } = await supabase
                .from("communities")
                .insert(communitiesData)
                .select("id, name");
              
              if (communitiesError) {
                console.error(`Error creating communities batch ${i/batchSize + 1}:`, communitiesError);
              } else {
                console.log(`✅ Created ${createdCommunities?.length || 0} communities in batch ${i/batchSize + 1}`);
                successCount += createdCommunities?.length || 0;
              }
            } catch (batchError) {
              console.error(`Error in batch ${i/batchSize + 1}:`, batchError);
            }
            
            // Small delay between batches
            if (i + batchSize < data.communities.length) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          console.log(`📊 Created ${successCount} out of ${data.communities.length} communities`);
          
          if (successCount === 0) {
            toast.warning("Could not create communities. You'll be able to add them later in the dashboard.");
          } else if (successCount < data.communities.length) {
            toast.warning(`Created ${successCount} out of ${data.communities.length} communities. You can add the rest later.`);
          } else {
            toast.success(`All ${successCount} communities created successfully!`);
          }
        }
        
        return newProject;
      } catch (error) {
        console.error("Error in createProject mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating project:", error);
      
      let errorMessage = "Failed to create project";
      
      if (error.code === "23505") {
        errorMessage = "A project with this name already exists";
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  });
};

// Function to commit all temporary data at the end of onboarding
export const commitOnboardingData = async () => {
  // Get the current user
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    console.error("User not authenticated when committing onboarding data");
    return { success: false, error: "User not authenticated" };
  }

  console.log("🔍 Committing onboarding data for user:", {
    userId: userData.user.id,
    email: userData.user.email
  });
  
  try {
    // Check if user exists before updating
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking user existence:", checkError);
      return { success: false, error: checkError.message };
    }

    if (!existingUser) {
      console.error("❌ User not found in users table:", userData.user.id);
      return { success: false, error: "User not found in users table" };
    }

    console.log("✅ Found user in users table:", {
      userId: existingUser.id,
      currentStep: existingUser.onboarding_step,
      email: existingUser.email
    });

    // Update user details
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        onboarding_step: 'bot_setup',
        updated_at: new Date().toISOString()
      })
      .eq("id", userData.user.id);

    if (userUpdateError) {
      console.error("❌ Error updating user onboarding step:", userUpdateError);
      return { success: false, error: userUpdateError.message };
    }

    console.log("✅ Successfully updated user onboarding step to 'bot_setup'");

    const tempData = getTempOnboardingData();
    if (!tempData.project) {
      console.error("No temporary project data found");
      return { success: false, error: "No temporary project data found" };
    }
    
    // Create project with bot token
    console.log("Creating project with data:", {
      name: tempData.project?.name || "Default Project",  
      description: tempData.project?.description,
      botToken: !!tempData.project?.bot_token,
      communitiesCount: tempData.project?.communities?.length || 0
    });

    const projectName = tempData.project?.name || `Project ${new Date().toISOString()}`;

    // First create the project
    const { data: newProject, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: projectName,  
        description: tempData.project?.description || null,
        owner_id: userData.user.id,
        bot_token: tempData.project?.bot_token || null
      })
      .select("*")
      .single();
    
    if (projectError) {
      console.error("❌ Error creating project at the end of onboarding:", projectError);
      return { success: false, error: projectError.message };
    }

    if (!newProject || !newProject.id) {
      console.error("❌ Project created but no ID returned");
      return { success: false, error: "Project created but no ID returned" };
    }

    const projectId = newProject.id;
    
    console.log("✅ Project created successfully:", {
      projectId: projectId,
      name: newProject.name,
      botTokenSet: !!tempData.project.bot_token
    });
    
    // Make sure project is fully committed before proceeding
    // Increased wait time to ensure bot settings are created by trigger
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create communities if any (with delay to ensure project is fully committed)
    let successfulCommunities = 0;
    
    if (tempData.project.communities && tempData.project.communities.length > 0) {
      console.log("📝 Creating communities for project:", {
        projectId: projectId,
        communitiesCount: tempData.project.communities.length
      });
      
      // Process communities in smaller batches to avoid overwhelming the database
      const batchSize = 3;
      
      for (let i = 0; i < tempData.project.communities.length; i += batchSize) {
        const batch = tempData.project.communities.slice(i, i + batchSize);
        console.log(`Processing community batch ${Math.floor(i/batchSize) + 1} (size: ${batch.length})`);
        
        const communitiesData = batch.map(chat => ({
          project_id: projectId,
          telegram_chat_id: chat.id,
          owner_id: userData.user.id,
          name: chat.title,
          description: chat.description || null,
          telegram_photo_url: chat.photo_url || null
        }));
        
        try {
          // Check if bot settings exist before creating communities
          const { data: botSettings, error: botSettingsError } = await supabase
            .from("telegram_bot_settings")
            .select("id")
            .eq("project_id", projectId)
            .maybeSingle();
            
          if (botSettingsError || !botSettings) {
            console.warn("Bot settings not found for project, waiting...");
            // Additional wait if bot settings aren't found
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          const { data: createdCommunities, error: communitiesError } = await supabase
            .from("communities")
            .insert(communitiesData)
            .select("id, name");
          
          if (communitiesError) {
            console.error(`Error creating communities batch ${Math.floor(i/batchSize) + 1}:`, communitiesError);
            
            // If error is related to foreign key constraint, wait and try once more
            if (communitiesError.code === '23503') {
              console.log("Foreign key constraint error. Waiting and trying again...");
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Try one more time
              const { data: retryCreatedCommunities, error: retryError } = await supabase
                .from("communities")
                .insert(communitiesData)
                .select("id, name");
                
              if (!retryError) {
                console.log(`✅ Retry successful! Created ${retryCreatedCommunities?.length || 0} communities`);
                successfulCommunities += retryCreatedCommunities?.length || 0;
              } else {
                console.error("Retry also failed:", retryError);
              }
            }
          } else {
            console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Created ${createdCommunities?.length || 0} communities`);
            successfulCommunities += createdCommunities?.length || 0;
          }
        } catch (batchError) {
          console.error(`Exception in batch ${Math.floor(i/batchSize) + 1}:`, batchError);
        }
        
        // Add a delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (successfulCommunities > 0) {
        console.log(`✅ Successfully created ${successfulCommunities} out of ${tempData.project.communities.length} communities`);
        toast.success(`Added ${successfulCommunities} communities to your project`);
      } else {
        console.error("❌ Failed to create any communities");
        // Don't fail the whole process if communities can't be created
        toast.error("Could not create communities. You can add them later in the dashboard.");
      }
    } else {
      console.log("⚠️ No communities found to create");
    }
    
    console.log("🎉 Successfully committed all onboarding data");
    
    // Update onboarding step to completed
    await supabase
      .from("users")
      .update({
        onboarding_step: 'completion',
        updated_at: new Date().toISOString()
      })
      .eq("id", userData.user.id);
    
    // Clear temporary storage
    // Only clear after successful completion
    onboardingTempData.project = undefined;
    
    return { success: true, projectId: projectId };
  } catch (error: any) {
    console.error("❌ Error committing onboarding data:", error);
    return { success: false, error: error.message || String(error) };
  }
};
