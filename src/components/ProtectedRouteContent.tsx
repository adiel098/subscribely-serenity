
import React from 'react';

interface ProtectedRouteContentProps {
  children: React.ReactNode;
}

export const ProtectedRouteContent: React.FC<ProtectedRouteContentProps> = ({ children }) => {
  return <>{children}</>;
};
