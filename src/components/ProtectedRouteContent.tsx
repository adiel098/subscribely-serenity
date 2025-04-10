
import React, { ReactElement } from 'react';

interface ProtectedRouteContentProps {
  children: ReactElement;
}

export const ProtectedRouteContent: React.FC<ProtectedRouteContentProps> = ({ children }) => {
  return children;
};
