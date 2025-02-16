import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Subscribers from "./pages/Subscribers";
import Subscriptions from "./pages/Subscriptions";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import BotSettings from "./pages/BotSettings";
import Events from "./pages/Events";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PlatformSelect from "./pages/PlatformSelect";
import TelegramConnect from "./pages/connect/TelegramConnect";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./components/Navbar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCommunities } from "@/hooks/useCommunities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";

const queryClient = new QueryClient();

type CommunityContextType = {
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunityContext = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunityContext must be used within a CommunityProvider');
  }
  return context;
};

const CommunityProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: communities } = useCommunities();
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  
  useEffect(() => {
    if (communities?.length && !selectedCommunityId) {
      setSelectedCommunityId(communities[0].id);
    }
  }, [communities, selectedCommunityId]);
  
  return (
    <CommunityContext.Provider value={{ selectedCommunityId, setSelectedCommunityId }}>
      {children}
    </CommunityContext.Provider>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const CommunitySelector = () => {
  const { data: communities } = useCommunities();
  const navigate = useNavigate();
  const { selectedCommunityId, setSelectedCommunityId } = useCommunityContext();
  
  return (
    <div className="fixed top-16 left-[280px] right-0 z-10 flex items-center justify-between gap-4 px-8 py-4 bg-white/80 border-b backdrop-blur-lg transition-all duration-300 shadow-sm">
      <Select 
        value={selectedCommunityId || undefined}
        onValueChange={setSelectedCommunityId}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select community" />
        </SelectTrigger>
        <SelectContent>
          {communities?.map((community) => (
            <SelectItem key={community.id} value={community.id}>
              {community.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="default" onClick={() => navigate("/platform-select")}>
          New Community
        </Button>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] mt-16">
          <CommunitySelector />
          <div className="min-h-full w-full bg-gray-50 p-8 mt-[4.5rem] pl-[280px]">
            {children}
          </div>
        </main>
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
          <SidebarProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Dashboard />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/members" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Members />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/subscribers" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Subscribers />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Subscriptions />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Messages />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Analytics />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/bot-settings" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <BotSettings />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/events" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Events />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Rewards />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <Settings />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/platform-select" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <PlatformSelect />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="/connect/telegram" element={
                <ProtectedRoute>
                  <CommunityProvider>
                    <DashboardLayout>
                      <TelegramConnect />
                    </DashboardLayout>
                  </CommunityProvider>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
