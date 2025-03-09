
import { useMemo, useState } from "react";
import { Subscriber } from "./useSubscribers";

export const useSubscriberFilters = (subscribers: Subscriber[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  // Get unique plans from subscribers for the filter dropdown
  const uniquePlans = useMemo(() => {
    const plans = new Set<string>();
    subscribers.forEach((subscriber) => {
      if (subscriber.plan?.name) {
        plans.add(subscriber.plan.name);
      }
    });
    return Array.from(plans);
  }, [subscribers]);

  // Filter subscribers based on search query, status, and plan
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      // Filter by search query
      const matchesSearch =
        searchQuery === "" ||
        subscriber.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subscriber.telegram_user_id.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      let matchesStatus = true;
      if (statusFilter !== "all") {
        matchesStatus = subscriber.subscription_status === statusFilter;
      }

      // Filter by plan
      const matchesPlan =
        planFilter === "all" || subscriber.plan?.name === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscribers, searchQuery, statusFilter, planFilter]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    uniquePlans,
  };
};
