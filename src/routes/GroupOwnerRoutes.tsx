
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/auth/guards/ProtectedRoute";
import { CommunityProvider } from "@/contexts/CommunityContext";
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import Dashboard from "@/group_owners/pages/Dashboard";
import Subscribers from "@/group_owners/pages/Subscribers";
import Subscriptions from "@/group_owners/pages/Subscriptions";
import Messages from "@/group_owners/pages/Messages";
import Analytics from "@/group_owners/pages/Analytics";
import BotSettings from "@/group_owners/pages/BotSettings";
import PlatformSelect from "@/group_owners/pages/PlatformSelect";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";

export const GroupOwnerRoutes = () => {
  return (
    <>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscribers" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <Subscribers />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/subscriptions" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <Subscriptions />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <Messages />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/bot-settings" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <BotSettings />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/platform-select" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <PlatformSelect />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/connect/telegram" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <TelegramConnect />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
    </>
  );
};
