
import { useState, useMemo } from "react";
import { Subscriber } from "./useSubscribers";

export const useSubscriberFilters = (subscribers: Subscriber[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);

  const filteredSubscribers = useMemo(() => {
    return (subscribers || []).filter((subscriber) => {
      // Search filter
      const matchesSearch = 
        (subscriber.telegram_username || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        subscriber.telegram_user_id
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (subscriber.first_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (subscriber.last_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && subscriber.subscription_status === "active") ||
        (statusFilter === "inactive" && subscriber.subscription_status !== "active");

      // Plan filter
      const matchesPlan =
        !planFilter ||
        subscriber.plan?.id === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscribers, searchQuery, statusFilter, planFilter]);

  // Extract unique plans for the filter dropdown
  const uniquePlans = useMemo(() => {
    const plans = (subscribers || [])
      .map((s) => s.plan)
      .filter(Boolean) as NonNullable<Subscriber['plan']>[];
    
    // Get unique plans by id
    const uniquePlanMap = new Map();
    plans.forEach(plan => {
      if (plan && !uniquePlanMap.has(plan.id)) {
        uniquePlanMap.set(plan.id, plan);
      }
    });
    
    return Array.from(uniquePlanMap.values());
  }, [subscribers]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter: (value: "all" | "active" | "inactive") => setStatusFilter(value), // Explicitly type the setter
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    uniquePlans
  };
};
