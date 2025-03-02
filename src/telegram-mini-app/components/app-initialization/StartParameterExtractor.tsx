
import { useState, useEffect, ReactNode } from "react";

interface StartParameterExtractorProps {
  children: ReactNode;
  startParam: string | null;
  isDevelopmentMode: boolean;
}

export const StartParameterExtractor: React.FC<StartParameterExtractorProps> = ({
  children,
  startParam,
  isDevelopmentMode
}) => {
  // Set effective start parameter (use default in dev mode)
  const effectiveStartParam = isDevelopmentMode && !startParam ? "dev123" : startParam;
  
  useEffect(() => {
    console.log('📌 Effective startParam:', effectiveStartParam);
  }, [effectiveStartParam]);

  return (
    <div data-effective-start-param={effectiveStartParam}>
      {children}
    </div>
  );
};
