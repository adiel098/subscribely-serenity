
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
          // For communities, get subscribers directly
          query = supabase.from('community_subscribers') // Updated from telegram_chat_members
          .select('id, subscription_status, subscription_end_date').eq('community_id', entityId);
        } else {
          // For groups, we need to get all community members that belong to this group
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
          // For groups, extract members from all communities in the group
          members = data.flatMap(groupMember => groupMember.community_subscribers || []);
        }
        const now = new Date();
        const inSevenDays = new Date();
        inSevenDays.setDate(now.getDate() + 7);

        // Calculate stats
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
  return <div className="grid gap-4 md:grid-cols-3 mb-6">
      {statsItems.map((item, index) => <motion.div key={index} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3,
      delay: index * 0.1
    }}>
          <Card className={`${item.bgClass} border-0 shadow-sm hover:shadow transition-shadow duration-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${item.bgClass} border border-${item.textClass.split('-')[1]}-200`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{item.title}</p>
                    <p className={`text-2xl font-bold ${item.textClass}`}>{item.value}</p>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.bgClass}`}>
                  {item.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>)}
    </div>;
};
