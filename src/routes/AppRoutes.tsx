import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Auth from "@/auth/pages/Auth";
import { ProtectedRoute } from "@/auth/guards/ProtectedRoute";
import { AdminProtectedRoute } from "@/auth/guards/AdminProtectedRoute";
import NotFound from "@/main/pages/NotFound";
import Index from "@/main/pages/Index";
import TelegramMiniApp from "@/telegram-mini-app/pages/TelegramMiniApp";

// Admin Pages
import Dashboard from "@/admin/pages/Dashboard";
import Users from "@/admin/pages/Users";
import Communities from "@/admin/pages/Communities";
import Payments from "@/admin/pages/Payments";
import Reports from "@/admin/pages/Reports";
import Settings from "@/admin/pages/Settings";

// Group Owner Pages
import OwnerDashboard from "@/group_owners/pages/Dashboard";
import Subscribers from "@/group_owners/pages/Subscribers";
import Subscriptions from "@/group_owners/pages/Subscriptions";
import PaymentMethods from "@/group_owners/pages/PaymentMethods";
import BotSettings from "@/group_owners/pages/BotSettings";
import PlatformPlans from "@/group_owners/pages/PlatformPlans";
import PlatformPayment from "@/group_owners/pages/PlatformPayment";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";
import MembifySettings from "@/group_owners/pages/MembifySettings";
import TelegramBot from "@/group_owners/pages/TelegramBot";
import CommunityEdit from "@/group_owners/pages/communities/CommunityEdit";
import GroupEdit from "@/group_owners/pages/groups/GroupEdit";
import { CouponsPage } from "@/group_owners/components/coupons/CouponsPage";

// Onboarding Pages
import Onboarding from "@/group_owners/pages/onboarding/Onboarding";

// Layouts
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import { AdminLayout } from "@/admin/components/AdminLayout";

import CustomBotNewCommunity from "@/group_owners/pages/new-community/CustomBotNewCommunity";

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<NotFound />} />

      {/* New Community Routes */}
      <Route path="/new-community/custom-bot" element={
        <ProtectedRoute>
          <CustomBotNewCommunity />
        </ProtectedRoute>
      } />

      {/* Onboarding Routes - handle all onboarding steps internally */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/onboarding/:step" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />

      {/* Group Owner Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout>
            <OwnerDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/subscribers" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Subscribers />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Subscriptions />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/coupons" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CouponsPage />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/payment-methods" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PaymentMethods />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <DashboardLayout>
            <PaymentMethods />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/bot-settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <BotSettings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/telegram-bot" element={
        <ProtectedRoute>
          <DashboardLayout>
            <TelegramBot />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/platform-plans" element={
        <ProtectedRoute>
          <PlatformPlans />
        </ProtectedRoute>
      } />
      <Route path="/platform-payment" element={
        <ProtectedRoute>
          <PlatformPayment />
        </ProtectedRoute>
      } />
      <Route path="/connect/telegram" element={
        <ProtectedRoute>
          <TelegramConnect />
        </ProtectedRoute>
      } />
      <Route path="/membify-settings" element={
        <ProtectedRoute>
          <DashboardLayout>
            <MembifySettings />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Community and Group Edit Routes */}
      <Route path="/communities/:communityId/edit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <CommunityEdit />
          </DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/groups/:groupId/edit" element={
        <ProtectedRoute>
          <DashboardLayout>
            <GroupEdit />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Dashboard />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Dashboard />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Users />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/communities" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Communities />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Payments />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Reports />} />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <AdminProtectedRoute>
          <AdminLayout dashboard={<Settings />} />
        </AdminProtectedRoute>
      } />

      {/* Telegram Mini App Route */}
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
    </Routes>
  );
};

export default AppRoutes;
