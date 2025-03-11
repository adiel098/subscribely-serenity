
import { useMemo } from "react";
import { DashboardSubscriber, PaymentStatistics } from "./types";

export const usePaymentStats = (
  filteredSubscribers: DashboardSubscriber[]
) => {
  const paymentStats = useMemo((): PaymentStatistics => {
    return {
      completed: filteredSubscribers.filter(sub => 
        sub.payment_status === "completed" || sub.payment_status === "successful"
      ).length,
      pending: filteredSubscribers.filter(sub => 
        sub.payment_status === "pending" || sub.payment_status === "processing"
      ).length,
      failed: filteredSubscribers.filter(sub => 
        sub.payment_status === "failed" || sub.payment_status === "error"
      ).length
    };
  }, [filteredSubscribers]);

  return { paymentStats };
};
