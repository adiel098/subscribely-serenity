
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/auth/contexts/AuthContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ProjectProvider } from "@/contexts/ProjectContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
