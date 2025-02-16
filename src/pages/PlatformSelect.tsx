
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BrandTelegram, BrandDiscord, BrandSlack } from "lucide-react";

const PlatformSelect = () => {
  const navigate = useNavigate();

  const platforms = [
    {
      name: "Telegram",
      icon: BrandTelegram,
      color: "bg-blue-500 hover:bg-blue-600",
      route: "/connect/telegram"
    },
    {
      name: "Discord",
      icon: BrandDiscord,
      color: "bg-indigo-500 hover:bg-indigo-600",
      route: "/connect/discord"
    },
    {
      name: "Slack",
      icon: BrandSlack,
      color: "bg-green-500 hover:bg-green-600",
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
              className={`w-full h-16 ${platform.color} text-white flex items-center justify-center space-x-3 text-lg`}
            >
              <platform.icon className="w-6 h-6" />
              <span>Connect with {platform.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformSelect;
