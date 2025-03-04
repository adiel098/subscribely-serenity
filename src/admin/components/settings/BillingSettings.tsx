
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Save } from "lucide-react";

export function BillingSettings() {
  return (
    <Card className="border-indigo-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-indigo-600" />
          Billing Settings
        </CardTitle>
        <CardDescription>
          Configure platform payment settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Payment Processors</h4>
                <p className="text-sm text-muted-foreground">
                  Configure payment gateways and processors
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Platform Fees</h4>
                <p className="text-sm text-muted-foreground">
                  Set platform fees and commission percentages
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Tax Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Configure tax calculation and reporting
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4 border-indigo-100">
              <div>
                <h4 className="font-medium">Invoice Templates</h4>
                <p className="text-sm text-muted-foreground">
                  Customize invoice and receipt templates
                </p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
          
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Billing Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
