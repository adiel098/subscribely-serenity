
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AuthProvider } from "@/auth/contexts/AuthContext";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <ProjectProvider>
            <CommunityProvider>
              <SidebarProvider defaultOpen={true}>
                <div className="flex w-full min-h-screen">
                  {children}
                </div>
              </SidebarProvider>
            </CommunityProvider>
          </ProjectProvider>
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};
