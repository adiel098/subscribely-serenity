import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Auth from "@/auth/pages/Auth";
import { ProtectedRoute } from "@/auth/guards/ProtectedRoute";
import { AdminProtectedRoute } from "@/auth/guards/AdminProtectedRoute";
import { ProtectedRouteContent } from "@/components/ProtectedRouteContent";
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
import NewProject from "@/group_owners/pages/projects/NewProject";

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

      {/* Project Management Routes */}
      <Route path="/projects/new" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <NewProject />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />

      {/* New Community Routes */}
      <Route path="/new-community/custom-bot" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <CustomBotNewCommunity />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />

      {/* Onboarding Routes - handle all onboarding steps internally */}
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <Onboarding />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/onboarding/:step" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <Onboarding />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />

      {/* Group Owner Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <OwnerDashboard />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/subscribers" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <Subscribers />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <Subscriptions />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/coupons" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <CouponsPage />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/payment-methods" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <PaymentMethods />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/messages" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <PaymentMethods />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/bot-settings" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <BotSettings />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/telegram-bot" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <TelegramBot />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/platform-plans" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <PlatformPlans />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/platform-payment" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <PlatformPayment />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/connect/telegram" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <TelegramConnect />
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/membify-settings" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <MembifySettings />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      
      {/* Community and Group Edit Routes */}
      <Route path="/communities/:communityId/edit" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <CommunityEdit />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />
      <Route path="/groups/:groupId/edit" element={
        <ProtectedRoute>
          <ProtectedRouteContent>
            <DashboardLayout>
              <GroupEdit />
            </DashboardLayout>
          </ProtectedRouteContent>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Dashboard />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Dashboard />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Users />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/communities" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Communities />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Payments />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Reports />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <AdminProtectedRoute>
          <ProtectedRouteContent>
            <AdminLayout dashboard={<Settings />} />
          </ProtectedRouteContent>
        </AdminProtectedRoute>
      } />

      {/* Telegram Mini App Route */}
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
    </Routes>
  );
};

export default AppRoutes;
