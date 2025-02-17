
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommunityProvider } from "@/features/community/providers/CommunityContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from "./features/admin/pages/Admin";

// Community Feature Pages
import Dashboard from "@/features/community/pages/Dashboard";
import Members from "@/features/community/pages/Members";
import Subscribers from "@/features/community/pages/Subscribers";
import Subscriptions from "@/features/community/pages/Subscriptions";
import Messages from "@/features/community/pages/Messages";
import Analytics from "@/features/community/pages/Analytics";
import BotSettings from "@/features/community/pages/BotSettings";
import Events from "@/features/community/pages/Events";
import Rewards from "@/features/community/pages/Rewards";
import Settings from "@/features/community/pages/Settings";
import PlatformSelect from "@/features/community/pages/PlatformSelect";
import TelegramConnect from "@/features/community/pages/connect/TelegramConnect";
import TelegramMiniApp from "@/features/community/pages/TelegramMiniApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/members" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Members />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/subscribers" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Subscribers />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Subscriptions />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Messages />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/bot-settings" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <BotSettings />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Events />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Rewards />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/platform-select" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <PlatformSelect />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/connect/telegram" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <TelegramConnect />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
