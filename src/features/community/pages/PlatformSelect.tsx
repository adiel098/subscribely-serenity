import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MessageSquare } from "lucide-react";

const PlatformSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Select Platform
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose the platform for your community
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Telegram</span>
            </CardTitle>
            <CardDescription>Connect your Telegram community</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/connect/telegram")} className="w-full">
              Connect Telegram
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span>Discord</span>
            </CardTitle>
            <CardDescription>Connect your Discord community</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Connect Discord (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-500" />
            <span>Other Platforms</span>
          </CardTitle>
          <CardDescription>Connect communities from other platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled className="w-full">
            Connect Other Platforms (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSelect;
