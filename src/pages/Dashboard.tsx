import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Settings, MessagesSquare, CreditCard, 
  Bot, Layout, PlusCircle, Bell, TrendingUp,
  ArrowUpRight, Calendar, ChevronDown
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useCommunities } from '@/hooks/useCommunities';
import { useCommunityContext } from '@/App';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();

  const addNewCommunity = () => {
    navigate('/platform-select');
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Communities Yet</h2>
          <p className="text-gray-600 mb-6">Get started by connecting your first community</p>
          <Button onClick={addNewCommunity}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Community
          </Button>
        </div>
      </div>
    );
  }

  const currentCommunity = communities.find(c => c.id === selectedCommunityId) || communities[0];

  if (!currentCommunity) {
    return null;
  }

  return (
    <div className="h-full space-y-6">
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Members</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{currentCommunity.member_count || 0}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+12% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscribers</h3>
            <CreditCard className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{currentCommunity.subscription_count || 0}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+5% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">${currentCommunity.subscription_revenue || '0.00'}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+8% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <MessagesSquare className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">2,431</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>+15% from last month</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Jan', value: 20 },
                  { name: 'Feb', value: 35 },
                  { name: 'Mar', value: 28 },
                  { name: 'Apr', value: 45 },
                ]}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Revenue</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={[
                  { name: 'Jan', value: 100 },
                  { name: 'Feb', value: 200 },
                  { name: 'Mar', value: 150 },
                  { name: 'Apr', value: 300 },
                ]}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="#6ee7b7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
