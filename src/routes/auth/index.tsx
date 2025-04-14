import { lazy } from "react";
import { RouteObject } from "react-router-dom";

// Lazy load auth page
const Auth = lazy(() => import("@/auth/pages/Auth"));

export const authRoutes: RouteObject[] = [
  {
    path: "/auth/*",
    element: <Auth />
  }
];
