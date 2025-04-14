import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider } from "@/auth/contexts/AuthContext";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <ProjectProvider>
            <SidebarProvider defaultOpen={true}>
              <div className="flex w-full min-h-screen">
                {children}
              </div>
            </SidebarProvider>
            <Toaster />
          </ProjectProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  );
};
