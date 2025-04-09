
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";

interface FirstTimeSetupHelpProps {
  isProject?: boolean;
}

export const FirstTimeSetupHelp = ({ isProject = false }: FirstTimeSetupHelpProps) => {
  return (
    <Card className="border-orange-100 bg-orange-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
          <CircleHelp className="h-5 w-5 text-orange-500" />
          {isProject ? 'Project Setup Guide' : 'Community Setup Guide'}
        </CardTitle>
        <CardDescription className="text-orange-700">
          {isProject
            ? "Let's set up your project to start managing your communities"
            : "Let's get your community ready to accept subscribers"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-orange-900">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">🚀 Getting Started</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              {isProject ? (
                <>
                  <li>
                    <Link to="/projects/settings" className="underline hover:text-orange-700">
                      Configure your project settings
                    </Link>
                  </li>
                  <li>
                    <Link to="/communities/new" className="underline hover:text-orange-700">
                      Add communities to your project
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/subscriptions" className="underline hover:text-orange-700">
                      Create subscription plans
                    </Link>{" "}
                    for your community
                  </li>
                  <li>
                    <Link to="/payment-methods" className="underline hover:text-orange-700">
                      Set up payment methods
                    </Link>{" "}
                    to accept payments
                  </li>
                </>
              )}
              <li>
                <Link to="/bot-settings" className="underline hover:text-orange-700">
                  Configure your bot settings
                </Link>{" "}
                for automated messages
              </li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">💡 Pro Tips</h3>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>
                Create multiple subscription tiers to offer different access levels
              </li>
              <li>
                Enable multiple payment methods to reach more subscribers
              </li>
              <li>
                Personalize welcome messages to engage new subscribers effectively
              </li>
              <li>
                Use reminder notifications to reduce subscription expirations
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
