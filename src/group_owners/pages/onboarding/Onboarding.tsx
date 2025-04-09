
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/contexts/AuthContext";
import { useOnboarding } from "@/group_owners/hooks/useOnboarding";
import { useOnboardingRouter } from "@/group_owners/hooks/onboarding/useOnboardingRouter";
import { StepRenderer } from "@/group_owners/components/onboarding/StepRenderer";
import { OnboardingLoading } from "@/group_owners/components/onboarding/OnboardingLoading";
import { toast } from "sonner";
import { localStorageService } from "@/utils/localStorageService";

const Onboarding = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectingRef = useRef(false);
  
  const { 
    state: onboardingState, 
    isLoading: onboardingHookLoading, 
    goToNextStep, 
    goToPreviousStep,
    completeOnboarding,
    saveCurrentStep
  } = useOnboarding();

  const {
    isLoading,
    isUrlProcessed
  } = useOnboardingRouter(onboardingState, onboardingHookLoading, saveCurrentStep);

  const handleCompleteOnboarding = async () => {
    if (redirectingRef.current) return;
    
    try {
      console.log("Handling complete onboarding...");
      redirectingRef.current = true;
      
      // Save the completed state
      await completeOnboarding();
      
      // Store completion in local storage
      localStorageService.setOnboardingStatus({ isCompleted: true, lastStep: "complete" });
      localStorageService.setHasCommunity(true);
      
      // Toast notification
      toast.success("Setup completed! Welcome to Membify.", {
        description: "You're ready to start managing your paid communities.",
        duration: 5000
      });
      
      // Use setTimeout to prevent React errors during navigation
      setTimeout(() => {
        console.log("Navigation to dashboard after completion");
        navigate('/dashboard', { replace: true });
      }, 300);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      redirectingRef.current = false;
      toast.error("Failed to complete setup", {
        description: "Please try again or contact support."
      });
    }
  };

  useEffect(() => {
    // If onboarding is complete, redirect to the dashboard
    if (!onboardingHookLoading && onboardingState.isCompleted && !redirectingRef.current) {
      console.log("Onboarding detected as complete in main component, redirecting");
      redirectingRef.current = true;
      
      // Use setTimeout to prevent React errors during navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
  }, [onboardingState.isCompleted, onboardingHookLoading, navigate]);

  // Extract the current path step
  const pathStep = location.pathname.split('/').pop();

  // Special case for complete step - redirect to dashboard
  if (pathStep === 'complete' || onboardingState.currentStep === 'complete') {
    if (!redirectingRef.current) {
      console.log("Complete step detected, redirecting to dashboard");
      redirectingRef.current = true;
      
      // Use setTimeout to prevent React errors during navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 300);
    }
    
    // Show loading while redirect happens
    return <OnboardingLoading />;
  }

  if (isLoading || onboardingHookLoading || !isUrlProcessed) {
    return <OnboardingLoading />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-indigo-50">
      <StepRenderer 
        currentStep={onboardingState.currentStep}
        pathStep={pathStep}
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
        handleCompleteOnboarding={handleCompleteOnboarding}
      />
    </div>
  );
};

export default Onboarding;
