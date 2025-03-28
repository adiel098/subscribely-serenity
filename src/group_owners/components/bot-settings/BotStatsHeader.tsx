import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarClock, TrendingUp, BadgeCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
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
    expiringSubscriptions: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchStats = async () => {
      if (!entityId) return;
      setIsLoading(true);
      try {
        let query;
        if (entityType === 'community') {
          query = supabase.from('community_subscribers').select('id, subscription_status, subscription_end_date').eq('community_id', entityId);
        } else {
          query = supabase.from('community_group_members').select(`
              community_id,
              community_subscribers!inner( 
                id, subscription_status, subscription_end_date
              )
            `).eq('group_id', entityId);
        }
        const {
          data,
          error
        } = await query;
        if (error) throw error;
        let members = [];
        if (entityType === 'community') {
          members = data;
        } else {
          members = data.flatMap(groupMember => groupMember.community_subscribers || []);
        }
        const now = new Date();
        const inSevenDays = new Date();
        inSevenDays.setDate(now.getDate() + 7);
        const totalMembers = members.length;
        const activeSubscriptions = members.filter(m => m.subscription_status === 'active').length;
        const expiringSubscriptions = members.filter(m => m.subscription_status === 'active' && m.subscription_end_date && new Date(m.subscription_end_date) < inSevenDays).length;
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
  const statsItems = [{
    title: "Total Members",
    value: stats.totalMembers,
    icon: <Users className="h-5 w-5 text-purple-600" />,
    bgClass: "bg-purple-50",
    textClass: "text-purple-700"
  }, {
    title: "Active Subscriptions",
    value: stats.activeSubscriptions,
    icon: <BadgeCheck className="h-5 w-5 text-green-600" />,
    bgClass: "bg-green-50",
    textClass: "text-green-700"
  }, {
    title: "Expiring Soon",
    value: stats.expiringSubscriptions,
    icon: <Clock className="h-5 w-5 text-amber-600" />,
    bgClass: "bg-amber-50",
    textClass: "text-amber-700"
  }];
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>;
  }
  return;
};