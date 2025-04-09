
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import RootLayout from "@/components/RootLayout";
import Dashboard from "@/group_owners/pages/Dashboard";
import Subscribers from "@/group_owners/pages/Subscribers";
import Subscriptions from "@/group_owners/pages/Subscriptions";
import Messages from "@/group_owners/pages/Messages";
import BotSettings from "@/group_owners/pages/BotSettings";
import TelegramBot from "@/group_owners/pages/TelegramBot";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";
import TelegramMiniApp from "@/telegram-mini-app/pages/TelegramMiniApp";
import NewProject from "@/group_owners/pages/projects/NewProject";
import ProjectSettings from "@/group_owners/pages/projects/ProjectSettings";
import { AuthProvider } from "@/auth/contexts/AuthContext";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProjectProvider } from "@/contexts/ProjectContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <CommunityProvider>
            <Routes>
              {/* Telegram Mini App */}
              <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
              
              {/* Main Application */}
              <Route element={<RootLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Project Management */}
                <Route path="/projects/new" element={<NewProject />} />
                <Route path="/projects/settings" element={<ProjectSettings />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subscribers" element={<Subscribers />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/bot-settings" element={<BotSettings />} />
                <Route path="/telegram-bot" element={<TelegramBot />} />
                
                {/* Connection routes */}
                <Route path="/connect/telegram" element={<TelegramConnect />} />
              </Route>
            </Routes>
            
            <Toaster />
            <SonnerToaster position="top-right" />
          </CommunityProvider>
        </ProjectProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
