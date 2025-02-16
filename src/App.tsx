
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PlatformSelect from "./pages/PlatformSelect";
import TelegramConnect from "./pages/connect/TelegramConnect";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunities } from "@/hooks/useCommunities";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

// Protected Route Component with Community Check
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: communities, isLoading: isLoadingCommunities } = useCommunities();

  const hasVerifiedCommunity = communities?.some(community => 
    community.telegram_chat_id || // if telegram chat id exists, it means the community is verified
    (community.platform !== 'telegram') // or if it's not a telegram community
  );
  
  if (loading || isLoadingCommunities) return null;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  // If user has no communities and isn't already on platform-select or connect pages, redirect there
  if (communities?.length === 0 && 
      !window.location.pathname.includes('/connect') && 
      window.location.pathname !== "/platform-select") {
    return <Navigate to="/platform-select" />;
  }

  // If user has communities but none are verified, and they're not on the connect page, redirect to connect
  if (communities?.length > 0 && 
      !hasVerifiedCommunity && 
      !window.location.pathname.includes('/connect')) {
    return <Navigate to="/connect/telegram" />;
  }

  // If user has verified communities and is on platform-select or connect pages, redirect to dashboard
  if (hasVerifiedCommunity && 
      (window.location.pathname === "/platform-select" || window.location.pathname.includes('/connect'))) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/platform-select" 
                element={
                  <ProtectedRoute>
                    <PlatformSelect />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/connect/telegram" 
                element={
                  <ProtectedRoute>
                    <TelegramConnect />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
