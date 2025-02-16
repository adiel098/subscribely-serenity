
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Settings, MessagesSquare, CreditCard, 
  Bot, Layout, PlusCircle, Bell, TrendingUp,
  ArrowUpRight, Calendar
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useCommunities } from '@/hooks/useCommunities';
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

  const addNewCommunity = () => {
    navigate('/platform-select');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back{user?.email ? `, ${user.email}` : ''}</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your communities and settings</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button onClick={addNewCommunity}>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Community
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Communities Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <Card 
              key={community.id}
              className="p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{community.name}</h3>
                  <p className="text-sm text-gray-500">
                    {community.platform === 'telegram' ? 'Telegram' : 'Discord'} Community
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => {}}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Users className="h-5 w-5 text-blue-500" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{community.member_count || 0}</p>
                  <p className="text-sm text-gray-500">Total Members</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{community.subscription_count || 0}</p>
                  <p className="text-sm text-gray-500">Subscribers</p>
                </div>
              </div>

              <div className="h-32 w-full mb-4">
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

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>${community.subscription_revenue || '0.00'} Revenue</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
