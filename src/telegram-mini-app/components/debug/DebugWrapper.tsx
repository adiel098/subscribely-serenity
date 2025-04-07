
import React from "react";
import { DebugInfo } from "./DebugInfo";
import { isDevelopment } from "../../utils/telegramUtils";
import { useSearchParams } from "react-router-dom";

interface DebugWrapperProps {
  telegramUser: any;
  community: any;
  activeSubscription?: any;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({
  telegramUser,
  community,
  activeSubscription
}) => {
  const [searchParams] = useSearchParams();
  const forceDebug = searchParams.get("debug") === "true";
  
  // Show in development or if debug=true parameter is present
  if (!isDevelopment() && !forceDebug) return null;
  
  return (
    <DebugInfo 
      telegramUser={telegramUser}
      community={community}
      activeSubscription={activeSubscription}
    />
  );
};
