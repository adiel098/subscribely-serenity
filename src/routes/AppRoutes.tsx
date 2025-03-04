
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
import Messages from "@/group_owners/pages/Messages";
import Analytics from "@/group_owners/pages/Analytics";
import BotSettings from "@/group_owners/pages/BotSettings";
import PlatformSelect from "@/group_owners/pages/PlatformSelect";
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
      <Route path="/messages" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Messages />
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
      <Route path="/platform-select" element={
        <ProtectedRoute>
          <PlatformSelect />
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
      <Route path="/telegram-connect" element={
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

      {/* Admin Routes - Using nested routes with Outlet pattern */}
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin" element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        } />
        <Route path="/admin/users" element={
          <AdminLayout>
            <Users />
          </AdminLayout>
        } />
        <Route path="/admin/communities" element={
          <AdminLayout>
            <Communities />
          </AdminLayout>
        } />
        <Route path="/admin/payments" element={
          <AdminLayout>
            <Payments />
          </AdminLayout>
        } />
        <Route path="/admin/reports" element={
          <AdminLayout>
            <Reports />
          </AdminLayout>
        } />
        <Route path="/admin/settings" element={
          <AdminLayout>
            <Settings />
          </AdminLayout>
        } />
      </Route>

      {/* Telegram Mini App Route */}
      <Route path="/telegram-mini-app" element={<TelegramMiniApp />} />
    </Routes>
  );
};

export default AppRoutes;
