
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";

export const NoPlanSelectedAlert = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-md py-16 px-4">
      <Alert className="bg-amber-50 border-amber-200">
        <Package className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 font-medium">No Plan Selected</AlertTitle>
        <AlertDescription className="text-amber-700">
          Please select a subscription plan first to continue with payment.
        </AlertDescription>
      </Alert>
      
      <div className="mt-6 text-center">
        <Button 
          onClick={() => navigate('/platform-plans')}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          View Subscription Plans
        </Button>
      </div>
    </div>
  );
};
