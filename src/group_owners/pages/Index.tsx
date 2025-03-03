
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminPermission } from "@/admin/hooks/useAdminPermission";
import { ArrowRight, Shield } from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Membify - Telegram Community Management Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Manage your communities, track subscriptions and payments, and enable automatic access to groups.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {user ? (
            <>
              {isAdmin ? (
                <Button asChild size="lg" className="text-lg bg-indigo-600 hover:bg-indigo-700">
                  <Link to="/admin/dashboard" className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Panel
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="text-lg">
                  <Link to="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
              )}
              
              {isAdmin && (
                <Button asChild variant="outline" size="lg" className="text-lg">
                  <Link to="/dashboard">
                    Group Owner Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </>
          ) : (
            <>
              <Button asChild size="lg" className="text-lg">
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="text-lg">
                <a href="https://t.me/membifybot" target="_blank" rel="noopener noreferrer">
                  Telegram Bot
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
