
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/features/telegram mini app/components/ui/button";
import { Plan } from "@/features/telegram mini app/pages/TelegramMiniApp";

interface SuccessScreenProps {
  plan: Plan;
  inviteLink: string;
}

export const SuccessScreen = ({ plan, inviteLink }: SuccessScreenProps) => {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Payment Successful!</h2>
        <p className="text-muted-foreground">
          You now have access to {plan.name}
        </p>
      </div>

      <Button
        size="lg"
        className="gap-2"
        onClick={() => window.location.href = inviteLink}
      >
        Join Community
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
