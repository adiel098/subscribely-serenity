
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
        
        // Create default bot settings for the project
        const { error: botSettingsError } = await supabase
          .from("telegram_bot_settings")
          .insert({
            project_id: newProject.id, // Using project_id consistently
            welcome_message: "Welcome to our group! 🎉",
            subscription_reminder_days: 3,
            subscription_reminder_message: "Your subscription is about to expire. Please renew to maintain access.",
            expired_subscription_message: "Your subscription has expired. Please renew to regain access.",
            renewal_discount_enabled: false,
            renewal_discount_percentage: 10,
            language: 'en',
            first_reminder_days: 3,
            first_reminder_message: "Your subscription will expire soon. Renew now to maintain access!",
            second_reminder_days: 1,
            second_reminder_message: "Final reminder: Your subscription expires tomorrow. Renew now!"
          })
          .select("*")
          .single();
        
        if (botSettingsError) {
          console.error("❌ Error creating bot settings:", botSettingsError);
          throw botSettingsError;
        }

        console.log("✅ Created default bot settings for project:", newProject.id);
        
        // Create communities if any
        if (data.communities && data.communities.length > 0) {
          const communitiesData = data.communities.map(chat => ({
            project_id: newProject.id,
            telegram_chat_id: chat.id,
            owner_id: user.id,
            name: chat.title,
            description: chat.description || null,
            telegram_photo_url: chat.photo_url || null
          }));

          const { error: communitiesError } = await supabase
            .from("communities")
            .insert(communitiesData);
          
          if (communitiesError) {
            console.error("Error creating communities:", communitiesError);
            toast.error("Warning: Some communities could not be created");
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
    
    // Verify the project exists before creating bot settings
    const { data: verifiedProject, error: verifyError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();
      
    if (verifyError || !verifiedProject) {
      console.error("❌ Project verification failed. Cannot create bot settings:", verifyError || "Project not found");
      return { success: false, error: "Project verification failed" };
    }
    
    console.log("✅ Project verified to exist:", projectId);
    
    // Create default bot settings with explicit delay to ensure project is committed
    // Add longer delay to make sure project is fully committed
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const botSettingsData = {
        project_id: projectId,
        welcome_message: "Welcome to our group! 🎉",
        subscription_reminder_days: 3,
        subscription_reminder_message: "Your subscription is about to expire. Please renew to maintain access.",
        expired_subscription_message: "Your subscription has expired. Please renew to regain access.",
        renewal_discount_enabled: false,
        renewal_discount_percentage: 10,
        language: 'en',
        first_reminder_days: 3,
        first_reminder_message: "Your subscription will expire soon. Renew now to maintain access!",
        second_reminder_days: 1,
        second_reminder_message: "Final reminder: Your subscription expires tomorrow. Renew now!"
      };
      
      console.log("📝 Creating bot settings with data:", {
        project_id: botSettingsData.project_id
      });
      
      const { error: botSettingsError } = await supabase
        .from("telegram_bot_settings")
        .insert(botSettingsData);
      
      if (botSettingsError) {
        console.error("❌ Error creating bot settings:", botSettingsError);
        // Continue despite bot settings error - don't return early
        // We want to try to create communities even if bot settings fail
      } else {
        console.log("✅ Created default bot settings for project:", projectId);
      }
    } catch (botError) {
      console.error("❌ Exception creating bot settings:", botError);
      // Continue despite bot settings error
    }
    
    // Create communities if any (with delay to ensure project is fully committed)
    // Add an even longer delay to ensure project is fully committed to database
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let successfulCommunities = 0;
    
    if (tempData.project.communities && tempData.project.communities.length > 0) {
      console.log("📝 Creating communities for project:", {
        projectId: projectId,
        communitiesCount: tempData.project.communities.length
      });
      
      // Log the community data for debugging
      console.log("Communities data:", tempData.project.communities.map(chat => ({
        project_id: projectId,
        telegram_chat_id: chat.id,
        owner_id: userData.user.id,
        name: chat.title,
        description: chat.description || null,
        telegram_photo_url: chat.photo_url || null
      })));
      
      // Try creating communities one by one to avoid batch issues
      for (const chat of tempData.project.communities) {
        const communityData = {
          project_id: projectId,
          telegram_chat_id: chat.id,
          owner_id: userData.user.id,
          name: chat.title,
          description: chat.description || null,
          telegram_photo_url: chat.photo_url || null
        };
        
        console.log(`Creating community: ${chat.title} (${chat.id})`);
        
        try {
          const { error: communityError } = await supabase
            .from("communities")
            .insert([communityData]);
            
          if (communityError) {
            console.error(`Error creating community ${chat.title}:`, communityError);
          } else {
            successfulCommunities++;
          }
        } catch (err) {
          console.error(`Exception creating community ${chat.title}:`, err);
        }
        
        // Small delay between community creations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (successfulCommunities > 0) {
        console.log(`✅ Successfully created ${successfulCommunities} out of ${tempData.project.communities.length} communities`);
        toast.success(`Added ${successfulCommunities} communities to your project`);
      } else {
        console.error("❌ Failed to create any communities");
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
