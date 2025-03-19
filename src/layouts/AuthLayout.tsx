
import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-50 overflow-hidden">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
