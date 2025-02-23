
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CommunityProvider } from '@/contexts/CommunityContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import PlatformSelect from '@/pages/PlatformSelect';
import TelegramConnect from '@/pages/connect/TelegramConnect';
import Dashboard from '@/group_owners/pages/Dashboard';
import Subscriptions from '@/group_owners/pages/Subscriptions';
import Analytics from '@/group_owners/pages/Analytics';
import BotSettings from '@/group_owners/pages/BotSettings';
import Messages from '@/group_owners/pages/Messages';
import Settings from '@/group_owners/pages/Settings';
import Subscribers from '@/group_owners/pages/Subscribers';
import TelegramMiniApp from '@/mini_app/pages/TelegramMiniApp';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CommunityProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/platform-select" element={<ProtectedRoute><PlatformSelect /></ProtectedRoute>} />
              <Route path="/connect/telegram" element={<ProtectedRoute><TelegramConnect /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/bot-settings" element={<ProtectedRoute><BotSettings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/subscribers" element={<ProtectedRoute><Subscribers /></ProtectedRoute>} />
              <Route path="/mini-app/:communityId" element={<TelegramMiniApp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </CommunityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
