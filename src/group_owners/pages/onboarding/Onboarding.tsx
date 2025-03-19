
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import WelcomeStep from "./steps/WelcomeStep";
import ConnectTelegramStep from "./steps/ConnectTelegramStep";
import PlatformPlanStep from "./steps/PlatformPlanStep";
import PaymentMethodStep from "./steps/PaymentMethodStep";
import CompleteStep from "./steps/CompleteStep";
import { useEffect } from "react";

const Onboarding = () => {
  const { state, goToNextStep, goToPreviousStep, saveCurrentStep, completeOnboarding, refreshStatus } = useOnboarding();
  const navigate = useNavigate();
  
  useEffect(() => {
    // When the current step changes in the state, navigate to the corresponding route
    if (state.currentStep) {
      navigate(`/onboarding/${state.currentStep}`, { replace: true });
    }
  }, [state.currentStep, navigate]);
  
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
            goToNextStep={() => handleStepNavigation('connect-telegram')} 
            goToPreviousStep={() => handleBackNavigation('connect-telegram')}
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
