import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PlatformSelect = () => {
  const navigate = useNavigate();

  const platforms = [
    {
      name: "Telegram",
      icon: "/lovable-uploads/0f9dcb59-a015-47ed-91ed-0f57d6e2c751.png",
      color: "border-[#229ED9] text-[#229ED9] hover:bg-blue-50",
      route: "/connect/telegram"
    },
    {
      name: "Discord",
      icon: "/lovable-uploads/c00577e9-67bf-4dcb-b6c9-c821640fcea2.png",
      color: "border-[#5865F2] text-[#5865F2] hover:bg-indigo-50",
      route: "/connect/discord"
    },
    {
      name: "Slack",
      icon: "/lovable-uploads/214f6259-adad-480f-81ba-77390e675f8b.png",
      color: "border-[#36BF7B] text-[#36BF7B] hover:bg-green-50",
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
              <img 
                src={platform.icon} 
                alt={`${platform.name} icon`}
                className="w-8 h-8 object-contain"
              />
              <span>Connect with {platform.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformSelect;
