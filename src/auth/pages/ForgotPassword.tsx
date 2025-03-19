
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export const ForgotPassword = () => {
  const { isLoading } = useAuth();
  
  // Redirect if already logged in
  useAuthRedirect();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-indigo-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
        <p className="text-center text-gray-600 mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="youremail@example.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
