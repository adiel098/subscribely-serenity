
import { useState, useEffect } from "react";
import { Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const PlatformSubscriptionBanner = () => {
  const [hasPlatformPlan, setHasPlatformPlan] = useState(true);
  const navigate = useNavigate();

  // Check if the user has an active platform subscription
  useEffect(() => {
    const checkPlatformSubscription = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user?.id) return;
        
        const { data, error } = await supabase
          .from('platform_subscriptions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .eq('is_active', true)
          .single();
        
        if (error || !data) {
          console.log('No active platform subscription found', error);
          setHasPlatformPlan(false);
        } else {
          console.log('Active platform subscription found', data);
          setHasPlatformPlan(true);
        }
      } catch (err) {
        console.error('Error checking platform subscription:', err);
      }
    };
    
    checkPlatformSubscription();
  }, []);

  if (hasPlatformPlan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 bg-amber-100 rounded-full p-1">
          <Package className="h-4 w-4 text-amber-600" />
        </div>
        <p className="text-amber-800 text-sm">No active platform subscription 🔔</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => navigate("/platform-plans")} 
            variant="ghost" 
            size="sm" 
            className="ml-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white gap-1 h-7 px-3 shadow-sm"
          >
            Upgrade 
            <ArrowRight className="h-3 w-3" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};
