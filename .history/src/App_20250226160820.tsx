import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";

import Index from "@/group_owners/pages/Index";
import Auth from "@/group_owners/pages/Auth";
import Dashboard from "@/group_owners/pages/Dashboard";
import Members from "@/group_owners/pages/Members";
import Subscribers from "@/group_owners/pages/Subscribers";
import Subscriptions from "@/group_owners/pages/Subscriptions";
import Messages from "@/group_owners/pages/Messages";
import Analytics from "@/group_owners/pages/Analytics";
import BotSettings from "@/group_owners/pages/BotSettings";
import Events from "@/group_owners/pages/Events";
import Rewards from "@/group_owners/pages/Rewards";
import Settings from "@/group_owners/pages/Settings";
import NotFound from "@/group_owners/pages/NotFound";
import PlatformSelect from "@/group_owners/pages/PlatformSelect";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";
import TelegramMiniApp from "@/telegram-mini-app/pages/TelegramMiniApp";

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
