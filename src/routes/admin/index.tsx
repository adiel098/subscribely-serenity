import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { AdminProtectedRoute } from "@/auth/guards/AdminProtectedRoute";

// Lazy loading admin pages
const Dashboard = lazy(() => import("@/admin/pages/Dashboard"));
const Users = lazy(() => import("@/admin/pages/Users"));
const Communities = lazy(() => import("@/admin/pages/Communities"));
const Payments = lazy(() => import("@/admin/pages/Payments"));
const Reports = lazy(() => import("@/admin/pages/Reports"));
const Settings = lazy(() => import("@/admin/pages/Settings"));

// Helper HOC for admin routes
const withAdminLayout = (Component: React.ComponentType) => {
  return (
    <AdminProtectedRoute>
      <AdminLayout dashboard={<Component />} />
    </AdminProtectedRoute>
  );
};

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: withAdminLayout(Dashboard)
  },
  {
    path: "/admin/dashboard",
    element: withAdminLayout(Dashboard)
  },
  {
    path: "/admin/users",
    element: withAdminLayout(Users)
  },
  {
    path: "/admin/communities",
    element: withAdminLayout(Communities)
  },
  {
    path: "/admin/payments",
    element: withAdminLayout(Payments)
  },
  {
    path: "/admin/reports",
    element: withAdminLayout(Reports)
  },
  {
    path: "/admin/settings",
    element: withAdminLayout(Settings)
  }
];
