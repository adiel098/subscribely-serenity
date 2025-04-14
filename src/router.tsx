
import { createBrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AppProviders } from "./providers/AppProviders";
import React from "react";

// Lazy loading helps with performance
const RoutesWithProviders = React.memo(() => (
  <AppProviders>
    <AppRoutes />
  </AppProviders>
));

// Create the router with a single route that renders our wrapped AppRoutes
export const router = createBrowserRouter([
  {
    path: "*",
    element: <RoutesWithProviders />
  }
]);
