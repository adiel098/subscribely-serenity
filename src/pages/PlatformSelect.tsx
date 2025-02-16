
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageCircle, MessagesSquare, Discord, Slack } from "lucide-react";

const PlatformSelect = () => {
  const navigate = useNavigate();

  const platforms = [
    {
      name: "Telegram",
      icon: MessageCircle,
      color: "border-blue-500 text-blue-500 hover:bg-blue-50",
      route: "/connect/telegram"
    },
    {
      name: "Discord",
      icon: Discord,
      color: "border-indigo-500 text-indigo-500 hover:bg-indigo-50",
      route: "/connect/discord"
    },
    {
      name: "Slack",
      icon: Slack,
      color: "border-green-500 text-green-500 hover:bg-green-50",
      route: "/connect/slack"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Choose Your Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select the platform where you want to manage your community
          </p>
        </div>

        <div className="space-y-4">
          {platforms.map((platform) => (
            <Button
              key={platform.name}
              onClick={() => navigate(platform.route)}
              variant="outline"
              className={`w-full h-20 border-2 bg-transparent ${platform.color} flex items-center justify-center space-x-3 text-lg transition-all duration-200`}
            >
              <platform.icon className="w-8 h-8" />
              <span>Connect with {platform.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformSelect;
