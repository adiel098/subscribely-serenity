
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp, ArrowUpRight, PlusCircle } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/auth/contexts/AuthContext';
import { useCommunities } from '@/group_owners/hooks/useCommunities';
import { useCommunityContext } from '@/contexts/CommunityContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSubscribers } from '@/group_owners/hooks/useSubscribers';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: communities, isLoading } = useCommunities();
  const { selectedCommunityId } = useCommunityContext();
  const { data: subscribers } = useSubscribers(selectedCommunityId || "");

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

  const activeSubscribers = subscribers?.filter(s => s.subscription_status) || [];
  const inactiveSubscribers = subscribers?.filter(s => !s.subscription_status) || [];
  
  // Calculate total revenue from all payments ever made (including expired subscriptions)
  const totalRevenue = (subscribers || []).reduce((sum, sub) => {
    // Sum all plan prices regardless of subscription status
    if (sub.plan) {
      const subscriptionAmount = sub.plan.price || 0;
      return sum + subscriptionAmount;
    }
    return sum;
  }, 0);

  const memberGrowthData = subscribers?.map(sub => ({
    date: new Date(sub.joined_at).toLocaleDateString(),
    members: 1
  })).reduce((acc: any[], curr) => {
    const existingDate = acc.find(d => d.date === curr.date);
    if (existingDate) {
      existingDate.members += curr.members;
    } else {
      acc.push(curr);
    }
    return acc;
  }, []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  return (
    <div className="h-full space-y-6 py-[5px] px-[14px]">
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Active Subscribers</h3>
            <CreditCard className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{activeSubscribers.length}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{((activeSubscribers.length / (subscribers?.length || 1)) * 100).toFixed(1)}% conversion</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Inactive Subscribers</h3>
            <CreditCard className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{inactiveSubscribers.length}</p>
          <div className="mt-2 flex items-center text-sm text-red-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>Expired subscriptions</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>${(totalRevenue / (subscribers?.length || 1)).toFixed(2)} per subscriber</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowthData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="members" stroke="#3b82f6" fill="#93c5fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={subscribers?.filter(sub => sub.plan).map(sub => ({
                  date: new Date(sub.subscription_start_date || '').toLocaleDateString(),
                  revenue: sub.plan?.price || 0
                }))} 
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#6ee7b7" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
