import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscribers from "./pages/Subscribers";
import Subscriptions from "./pages/Subscriptions";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import BotSettings from "./pages/BotSettings";
import Events from "./pages/Events";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PlatformSelect from "./pages/PlatformSelect";
import TelegramConnect from "./pages/connect/TelegramConnect";
import TelegramMiniApp from "./pages/TelegramMiniApp";
import Admin from "./pages/Admin";

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
              <Route path="/admin" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Admin />
                  </DashboardLayout>
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
