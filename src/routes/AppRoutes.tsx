
import { Route, Routes } from "react-router-dom";
import Index from "@/main/pages/Index";
import Auth from "@/auth/pages/Auth";
import NotFound from "@/main/pages/NotFound";
import TelegramMiniApp from "@/telegram-mini-app/pages/TelegramMiniApp";
import { AdminProtectedRoute } from "@/auth/guards/AdminProtectedRoute";
import { AdminLayout } from "@/admin/components/AdminLayout";
import AdminDashboard from "@/admin/pages/Dashboard";
import AdminCommunities from "@/admin/pages/Communities";
import AdminUsers from "@/admin/pages/Users";
import AdminPayments from "@/admin/pages/Payments";
import AdminReports from "@/admin/pages/Reports";
import AdminSettings from "@/admin/pages/Settings";
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
import PlatformPlans from "@/group_owners/pages/PlatformPlans";
import PlatformPaymentMethods from "@/group_owners/pages/PlatformPaymentMethods";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
      
      {/* Admin Routes - Using AdminProtectedRoute as the parent */}
      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/communities" element={<AdminCommunities />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
      
      {/* Group Owner Routes */}
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
        path="/platform-plans" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <PlatformPlans />
              </DashboardLayout>
            </CommunityProvider>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/platform-payment-methods" 
        element={
          <ProtectedRoute>
            <CommunityProvider>
              <DashboardLayout>
                <PlatformPaymentMethods />
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
      
      {/* 404 Not Found Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
