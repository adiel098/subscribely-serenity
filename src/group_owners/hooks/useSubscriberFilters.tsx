
import { useState } from "react";
import { Subscriber } from "./useSubscribers";

export const useSubscriberFilters = (subscribers: Subscriber[] = []) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);

  const filteredSubscribers = (subscribers || []).filter((subscriber) => {
    const matchesSearch = (subscriber.telegram_username || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      subscriber.telegram_user_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && subscriber.subscription_status) ||
      (statusFilter === "inactive" && !subscriber.subscription_status);

    const matchesPlan =
      !planFilter ||
      subscriber.plan?.id === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const uniquePlans = Array.from(
    new Set((subscribers || []).map((s) => s.plan).filter(Boolean))
  );

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    uniquePlans
  };
};
