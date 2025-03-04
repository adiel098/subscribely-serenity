
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileText, Save } from "lucide-react";

export function ApiSettings() {
  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Manage API keys and access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">API Keys</h3>
            <div className="rounded-lg border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-50 p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Live API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    For production environment
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input 
                    value="sk_live_xxxxxxxxxxxxxxxxxxxxx" 
                    readOnly 
                    className="w-64 bg-white border-indigo-100"
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Test API Key</h4>
                  <p className="text-sm text-muted-foreground">
                    For development and testing
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input 
                    value="sk_test_xxxxxxxxxxxxxxxxxxxxx" 
                    readOnly 
                    className="w-64 border-indigo-100"
                  />
                  <Button variant="outline">Copy</Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <h3 className="text-lg font-medium">Webhooks</h3>
              <div className="rounded-lg border border-indigo-100 p-4">
                <div className="mb-4">
                  <h4 className="font-medium">Webhook URL</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    URL to receive webhook events
                  </p>
                  <Input 
                    placeholder="https://example.com/webhooks/membify" 
                    className="border-indigo-100"
                  />
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Events to send</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['payment.success', 'payment.failed', 'user.created', 'subscription.renewed'].map(event => (
                      <div key={event} className="flex items-center space-x-2">
                        <Switch id={event} defaultChecked={true} />
                        <label htmlFor={event} className="text-sm">
                          {event}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save API Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
