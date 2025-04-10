
import React, { ReactNode } from 'react';

interface ProtectedRouteContentProps {
  children: ReactNode;
}

export const ProtectedRouteContent: React.FC<ProtectedRouteContentProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRouteContent;
