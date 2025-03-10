
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const NoPlanSelectedAlert = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-6xl px-4 py-10">
      <Alert variant="destructive" className="border-red-200 bg-red-50/80">
        <AlertTitle className="text-lg font-medium">No Plan Selected</AlertTitle>
        <AlertDescription className="text-red-700">
          Please go back and select a subscription plan first.
        </AlertDescription>
      </Alert>
      <Button 
        onClick={() => navigate('/platform-plans')}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Plans
      </Button>
    </div>
  );
};
