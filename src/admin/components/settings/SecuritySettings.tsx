
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Lock, Save } from "lucide-react";

export function SecuritySettings() {
  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-600" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Configure platform security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">
                  Require two-factor authentication for admin accounts
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Password Policies</h4>
                <p className="text-sm text-muted-foreground">
                  Enforce strong password requirements
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Session Timeout</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically log out inactive sessions
                </p>
              </div>
              <Switch defaultChecked={true} />
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">IP Restrictions</h4>
                <p className="text-sm text-muted-foreground">
                  Restrict admin access to specific IP addresses
                </p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Security Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
