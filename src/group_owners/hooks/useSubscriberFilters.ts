
import { useState, useMemo } from "react";
import { Subscriber } from "./useSubscribers";

export const useSubscriberFilters = (subscribers: Subscriber[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [planFilter, setPlanFilter] = useState<string | null>(null);

  const uniquePlans = useMemo(() => {
    return Array.from(
      new Set(subscribers
        .filter(s => s.plan)
        .map(s => JSON.stringify(s.plan))
      )
    ).map(planString => JSON.parse(planString));
  }, [subscribers]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const matchesSearch = (subscriber.telegram_username || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (subscriber.telegram_user_id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subscriber.first_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (subscriber.last_name || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && subscriber.subscription_status === "active") ||
        (statusFilter === "inactive" && subscriber.subscription_status !== "active");

      const matchesPlan =
        !planFilter ||
        subscriber.plan?.id === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [subscribers, searchQuery, statusFilter, planFilter]);

  // Split subscribers into managed and unmanaged - משתמשים מנוהלים ולא מנוהלים
  const managedSubscribers = useMemo(() => {
    return filteredSubscribers.filter(sub => 
      // התנאי החדש לסיווג מנויים מנוהלים:
      // 1. בעל סטטוס מנוי פעיל (המצב החשוב ביותר)
      sub.subscription_status === "active" || 
      // 2. או שיש לו תוכנית מוגדרת (גם אם הסטטוס לא פעיל כרגע)
      (sub.plan !== null && sub.plan !== undefined)
    );
  }, [filteredSubscribers]);

  const unmanagedUsers = useMemo(() => {
    return filteredSubscribers.filter(sub => 
      // התנאי החדש לסיווג משתמשים לא מנוהלים:
      // 1. סטטוס מנוי לא פעיל
      sub.subscription_status !== "active" && 
      // 2. וגם אין לו תוכנית מוגדרת 
      (sub.plan === null || sub.plan === undefined) &&
      // 3. המשתמש עצמו עדיין פעיל במערכת
      sub.is_active
    );
  }, [filteredSubscribers]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    filteredSubscribers,
    managedSubscribers,
    unmanagedUsers,
    uniquePlans
  };
};
