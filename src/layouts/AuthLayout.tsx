
import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-10 flex justify-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
