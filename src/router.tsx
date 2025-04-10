
import { createBrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AppProviders } from "./providers/AppProviders";

// Simple wrapper for AppRoutes that applies providers
const RoutesWithProviders = () => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
);

// Create the router with a single route that renders our wrapped AppRoutes
export const router = createBrowserRouter([
  {
    path: "*",
    element: <RoutesWithProviders />
  }
]);
