
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const NoPlanSelectedAlert = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-6xl px-4 py-10">
      <Alert variant="destructive">
        <AlertTitle>No Plan Selected</AlertTitle>
        <AlertDescription>
          Please go back and select a subscription plan first.
        </AlertDescription>
      </Alert>
      <Button 
        onClick={() => navigate('/platform-plans')}
        className="mt-4"
      >
        Back to Plans
      </Button>
    </div>
  );
};
