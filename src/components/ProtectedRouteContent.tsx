
import React, { ReactNode } from 'react';

interface ProtectedRouteContentProps {
  children: ReactNode;
}

export const ProtectedRouteContent = ({ children }: ProtectedRouteContentProps) => {
  return <>{children}</>;
};
