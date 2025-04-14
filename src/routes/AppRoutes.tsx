import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { adminRoutes } from "./admin";
import { authRoutes } from "./auth";
import { commonRoutes } from "./common";
import { groupOwnerRoutes } from "./group_owners";
import { telegramRoutes } from "./telegram";

// Loading component for suspense fallback
const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    <span className="ml-2 text-lg">Loading...</span>
  </div>
);

const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Common Routes */}
        {commonRoutes.map((route, index) => (
          <Route
            key={`common-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Auth Routes */}
        {authRoutes.map((route, index) => (
          <Route 
            key={`auth-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Group Owner Routes */}
        {groupOwnerRoutes.map((route, index) => (
          <Route
            key={`group-owner-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Admin Routes */}
        {adminRoutes.map((route, index) => (
          <Route
            key={`admin-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}

        {/* Telegram Mini App Routes */}
        {telegramRoutes.map((route, index) => (
          <Route
            key={`telegram-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
