
import { useMemo } from "react";
import { DashboardSubscriber, PaymentStatistics } from "./types";

export const usePaymentStats = (
  filteredSubscribers: DashboardSubscriber[]
) => {
  const paymentStats = useMemo((): PaymentStatistics => {
    // Count the number of completed, pending, and failed payments
    const completed = filteredSubscribers.filter(sub => 
      sub.payment_status === "completed" || 
      sub.payment_status === "successful" || 
      (sub.subscription_status === "active" && sub.plan)
    ).length;
    
    const pending = filteredSubscribers.filter(sub => 
      sub.payment_status === "pending" || 
      sub.payment_status === "processing"
    ).length;
    
    const failed = filteredSubscribers.filter(sub => 
      sub.payment_status === "failed" || 
      sub.payment_status === "error"
    ).length;
    
    // Calculate total by adding the counts
    const total = completed + pending + failed;
    
    // If no explicit payment statuses are set, but there are active subscribers,
    // we assume they have completed payments
    const hasActiveWithoutStatus = filteredSubscribers.some(sub => 
      sub.subscription_status === "active" && 
      !sub.payment_status &&
      sub.plan
    );
    
    console.log("Payment stats calculated:", { completed, pending, failed, total, hasActiveWithoutStatus });
    
    return {
      completed: completed || (hasActiveWithoutStatus ? filteredSubscribers.filter(sub => sub.subscription_status === "active").length : 0),
      pending,
      failed,
      total: total || (hasActiveWithoutStatus ? filteredSubscribers.filter(sub => sub.subscription_status === "active").length : 0)
    };
  }, [filteredSubscribers]);

  return { paymentStats };
};
