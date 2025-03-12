
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BotStatsHeaderProps {
  entityId: string;
  entityType: 'community' | 'group';
}

export const BotStatsHeader = ({ 
  entityId, 
  entityType 
}: BotStatsHeaderProps) => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeSubscriptions: 0,
    expiringSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!entityId) return;
      
      setIsLoading(true);
      try {
        let query;
        
        if (entityType === 'community') {
          // For communities, get subscribers directly
          query = supabase
            .from('community_subscribers') // Updated from telegram_chat_members
            .select('id, subscription_status, subscription_end_date')
            .eq('community_id', entityId);
        } else {
          // For groups, we need to get all community members that belong to this group
          query = supabase
            .from('community_group_members')
            .select(`
              community_id,
              community_subscribers!inner( 
                id, subscription_status, subscription_end_date
              )
            `)
            .eq('group_id', entityId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        let members = [];
        if (entityType === 'community') {
          members = data;
        } else {
          // For groups, extract members from all communities in the group
          members = data.flatMap(groupMember => 
            groupMember.community_subscribers || []
          );
        }
        
        const now = new Date();
        const inSevenDays = new Date();
        inSevenDays.setDate(now.getDate() + 7);
        
        // Calculate stats
        const totalMembers = members.length;
        const activeSubscriptions = members.filter(
          m => m.subscription_status === 'active'
        ).length;
        const expiringSubscriptions = members.filter(
          m => 
            m.subscription_status === 'active' && 
            m.subscription_end_date && 
            new Date(m.subscription_end_date) < inSevenDays
        ).length;
        
        setStats({
          totalMembers,
          activeSubscriptions,
          expiringSubscriptions
        });
      } catch (err) {
        console.error('Error fetching bot stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [entityId, entityType]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Members
          </CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Subscriptions
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Expiring Soon
          </CardTitle>
          <CalendarClock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">{stats.expiringSubscriptions}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
