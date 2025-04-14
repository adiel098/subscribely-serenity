import { lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";

// Lazy load common pages
const NotFound = lazy(() => import("@/main/pages/NotFound"));
const Index = lazy(() => import("@/main/pages/Index"));

export const commonRoutes: RouteObject[] = [
  // Redirect root to dashboard
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  // 404 page
  {
    path: "*",
    element: <NotFound />
  }
];
