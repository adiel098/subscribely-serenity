import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gift, Gem, CheckCircle2 } from "lucide-react";
import { useCommunityContext } from '@/features/community/providers/CommunityContext';

const Rewards = () => {
  const { toast } = useToast();
  const { selectedCommunityId } = useCommunityContext();

  return (
    <div className="container max-w-4xl py-6 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rewards</h1>
        <p className="text-sm text-muted-foreground">
          Incentivize community engagement with custom rewards
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="h-5 w-5" />
              <span>Welcome Reward</span>
            </CardTitle>
            <CardDescription>
              Automatically reward new members upon joining
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure a welcome gift for new members to boost initial
              engagement.
            </p>
            <Button className="mt-4">Configure Reward</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gem className="h-5 w-5" />
              <span>Engagement Milestones</span>
            </CardTitle>
            <CardDescription>
              Reward members for reaching engagement milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Set up rewards for members who actively participate in the
              community.
            </p>
            <Button className="mt-4">Set Up Milestones</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Subscription Anniversary</span>
            </CardTitle>
            <CardDescription>
              Recognize and reward long-term subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically give rewards to subscribers on their subscription
              anniversary.
            </p>
            <Button className="mt-4">Configure Anniversary Rewards</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Rewards;
