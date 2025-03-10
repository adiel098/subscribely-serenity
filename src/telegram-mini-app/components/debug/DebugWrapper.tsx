
import React from "react";
import { DebugInfo } from "./DebugInfo";
import { isDevelopment } from "../../utils/telegramUtils";

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
  if (!isDevelopment()) return null;
  
  return (
    <DebugInfo 
      telegramUser={telegramUser}
      community={community}
      activeSubscription={activeSubscription}
    />
  );
};
