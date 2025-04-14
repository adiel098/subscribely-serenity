import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppProviders } from "./providers/AppProviders";
import { adminRoutes } from "./routes/admin";
import { authRoutes } from "./routes/auth";
import { commonRoutes } from "./routes/common";
import { groupOwnerRoutes } from "./routes/group_owners";
import { telegramRoutes } from "./routes/telegram";
import { Loader2 } from "lucide-react";

// Lazy load the main app component
const AppRoutes = lazy(() => import("./routes/AppRoutes"));

// Loading component for suspense fallback
const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <span className="ml-2 text-lg">Loading...</span>
  </div>
);

// Create a wrapped component that includes providers
const RoutesWithProviders = () => (
  <AppProviders>
    <Suspense fallback={<LoadingScreen />}>
      <AppRoutes />
    </Suspense>
  </AppProviders>
);

// Create the router using the createBrowserRouter function
export const router = createBrowserRouter([
  {
    path: "*",
    element: <RoutesWithProviders />
  }
]);

// Component for direct use in Router Provider (used in App.tsx)
export const RouterConfig = () => {
  return <RouterProvider router={router} />;
};
