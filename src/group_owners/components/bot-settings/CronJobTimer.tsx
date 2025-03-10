
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect } from "react";
import { useCronJobStatus } from "@/group_owners/hooks/useCronJobStatus";
import { useTriggerSubscriptionCheck } from "@/group_owners/hooks/useTriggerSubscriptionCheck";
import { CronJobHeader } from "./cron-job/CronJobHeader";
import { CronJobTriggerButton } from "./cron-job/CronJobTriggerButton";
import { CronJobStatusInfo } from "./cron-job/CronJobStatusInfo";

export const CronJobTimer = () => {
  const { status, fetchLatestRunStatus, selectedCommunityId } = useCronJobStatus();
  const { triggerManualCheck, isLoading } = useTriggerSubscriptionCheck(selectedCommunityId);
  
  const handleTriggerCheck = async () => {
    const success = await triggerManualCheck();
    if (success) {
      // Wait a moment then fetch the updated status
      setTimeout(() => {
        fetchLatestRunStatus();
      }, 3000);
    }
  };

  return (
    <Card className="animate-fade-in bg-purple-100/70 border-purple-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CronJobHeader status={status} />
          <CronJobTriggerButton 
            isLoading={isLoading || status.isLoading}
            onClick={handleTriggerCheck}
            selectedCommunityId={selectedCommunityId}
          />
        </div>
      </CardHeader>
      <CardContent>
        <CronJobStatusInfo status={status} />
      </CardContent>
    </Card>
  );
};
