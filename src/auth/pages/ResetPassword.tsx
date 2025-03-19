
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export const ResetPassword = () => {
  const { isLoading } = useAuth();
  const location = useLocation();
  
  // Redirect if already logged in
  useAuthRedirect();

  // Get the token from URL query parameters
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset confirmation logic using the token
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create New Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" placeholder="••••••••" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !token}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-indigo-600 hover:text-indigo-800">
              Back to Login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
