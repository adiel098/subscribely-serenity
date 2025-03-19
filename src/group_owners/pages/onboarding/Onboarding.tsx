
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { WelcomeStep } from "./steps/WelcomeStep";
import { ConnectTelegramStep } from "./steps/ConnectTelegramStep";
import { PlatformPlanStep } from "./steps/PlatformPlanStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import { CompleteStep } from "./steps/CompleteStep";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Onboarding = () => {
  const { state, isLoading, goToNextStep, saveCurrentStep, completeOnboarding, refreshStatus } = useOnboarding();
  const navigate = useNavigate();
  
  useEffect(() => {
    // When the current step changes in the state, navigate to the corresponding route
    if (!isLoading && state.currentStep) {
      navigate(`/onboarding/${state.currentStep}`, { replace: true });
    }
  }, [state.currentStep, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-indigo-900 font-medium">Loading your setup...</p>
        </div>
      </div>
    );
  }
  
  // If onboarding is completed, redirect to dashboard
  if (state.isCompleted) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleStepNavigation = (currentStep) => {
    goToNextStep(currentStep);
  };
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/welcome" replace />} />
      <Route 
        path="/welcome" 
        element={
          <WelcomeStep 
            goToNextStep={() => handleStepNavigation('welcome')} 
          />
        } 
      />
      <Route 
        path="/connect-telegram" 
        element={
          <ConnectTelegramStep 
            goToNextStep={() => handleStepNavigation('connect-telegram')} 
            isTelegramConnected={state.isTelegramConnected}
            saveCurrentStep={saveCurrentStep}
          />
        } 
      />
      <Route 
        path="/platform-plan" 
        element={
          <PlatformPlanStep 
            goToNextStep={() => handleStepNavigation('platform-plan')} 
            hasPlatformPlan={state.hasPlatformPlan}
            saveCurrentStep={saveCurrentStep}
          />
        } 
      />
      <Route 
        path="/payment-method" 
        element={
          <PaymentMethodStep 
            goToNextStep={() => handleStepNavigation('payment-method')} 
            hasPaymentMethod={state.hasPaymentMethod}
            saveCurrentStep={saveCurrentStep}
          />
        } 
      />
      <Route 
        path="/complete" 
        element={
          <CompleteStep 
            completeOnboarding={completeOnboarding} 
            state={state}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
    </Routes>
  );
};

export default Onboarding;
