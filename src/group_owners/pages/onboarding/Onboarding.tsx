
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { useEffect, useState } from "react";
import { WelcomeStep } from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import { PlatformPlanStep } from "./steps/PlatformPlanStep";
import { PaymentMethodStep } from "./steps/PaymentMethodStep";
import CompleteStep from "./steps/CompleteStep";

const Onboarding = () => {
  const { state, goToNextStep, goToPreviousStep, saveCurrentStep, completeOnboarding, refreshStatus } = useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // On initial load, get the current pathname and navigate directly to it
  // This prevents the "flashing" of welcome page before redirecting
  useEffect(() => {
    if (isInitialLoad) {
      const currentPath = location.pathname.split('/').pop();
      
      // If we have a valid step in the URL and it's not already the current step in state
      if (currentPath && currentPath !== 'onboarding' && currentPath !== state.currentStep) {
        // Only save if it's a valid onboarding step
        if (['welcome', 'connect-telegram', 'platform-plan', 'payment-method', 'complete'].includes(currentPath)) {
          console.log(`Direct navigation to ${currentPath}, updating state`);
          saveCurrentStep(currentPath as any);
        }
      }
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, location.pathname, state.currentStep]);

  // When the current step changes in the state, navigate to the corresponding route
  // But only after initial load to prevent redundant navigations
  useEffect(() => {
    if (!isInitialLoad && state.currentStep) {
      navigate(`/onboarding/${state.currentStep}`, { replace: true });
    }
  }, [state.currentStep, navigate, isInitialLoad]);
  
  // If onboarding is completed, redirect to dashboard
  useEffect(() => {
    if (state.isCompleted) {
      console.log("Onboarding is completed, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [state.isCompleted, navigate]);
  
  const handleStepNavigation = (currentStep) => {
    goToNextStep(currentStep);
  };
  
  const handleBackNavigation = (currentStep) => {
    goToPreviousStep(currentStep);
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
            onComplete={() => handleStepNavigation('connect-telegram')}
            activeStep={state.currentStep === 'connect-telegram'} 
            goToPreviousStep={() => handleBackNavigation('connect-telegram')}
          />
        } 
      />
      <Route 
        path="/platform-plan" 
        element={
          <PlatformPlanStep 
            goToNextStep={() => handleStepNavigation('platform-plan')} 
            goToPreviousStep={() => handleBackNavigation('platform-plan')}
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
            goToPreviousStep={() => handleBackNavigation('payment-method')}
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
            goToPreviousStep={() => handleBackNavigation('complete')}
            state={state}
          />
        } 
      />
      <Route path="*" element={<Navigate to="/onboarding/welcome" replace />} />
    </Routes>
  );
};

export default Onboarding;
