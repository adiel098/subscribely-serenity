import { Route, Routes, useLocation } from "react-router-dom";
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
import Analytics from "@/group_owners/pages/Analytics";
import BotSettings from "@/group_owners/pages/BotSettings";
import PlatformPlans from "@/group_owners/pages/PlatformPlans";
import PlatformPayment from "@/group_owners/pages/PlatformPayment";
import TelegramConnect from "@/group_owners/pages/connect/TelegramConnect";
import MembifySettings from "@/group_owners/pages/MembifySettings";

// Layouts
import { DashboardLayout } from "@/group_owners/components/DashboardLayout";
import { AdminLayout } from "@/admin/components/AdminLayout";

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      {/* Main Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />

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
      <Route path="/analytics" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Analytics />
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

      {/* Admin Routes */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout dashboard={<Dashboard />} />} />
        <Route path="/admin/dashboard" element={<AdminLayout dashboard={<Dashboard />} />} />
        <Route path="/admin/users" element={<AdminLayout dashboard={<Users />} />} />
        <Route path="/admin/communities" element={<AdminLayout dashboard={<Communities />} />} />
        <Route path="/admin/payments" element={<AdminLayout dashboard={<Payments />} />} />
        <Route path="/admin/reports" element={<AdminLayout dashboard={<Reports />} />} />
        <Route path="/admin/settings" element={<AdminLayout dashboard={<Settings />} />} />
      </Route>

      {/* Telegram Mini App Route */}
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
    </Routes>
  );
};

export default AppRoutes;
