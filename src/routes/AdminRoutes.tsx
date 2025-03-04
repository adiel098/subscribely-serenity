
import { Route } from "react-router-dom";
import { AdminProtectedRoute } from "@/auth/guards/AdminProtectedRoute";
import { AdminLayout } from "@/admin/components/AdminLayout";
import AdminDashboard from "@/admin/pages/Dashboard";
import AdminCommunities from "@/admin/pages/Communities";
import AdminUsers from "@/admin/pages/Users";

export const AdminRoutes = () => {
  return (
    <>
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/communities" 
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminCommunities />
            </AdminLayout>
          </AdminProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminProtectedRoute>
        } 
      />
    </>
  );
};
