
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminPermission } from "@/auth/hooks/useAdminPermission";
import { ArrowRight, Shield, LogIn, UserPlus, Sparkles } from "lucide-react";

export const HeroSection = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();

  return (
    <motion.section 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }} 
      className="pt-32 pb-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 w-full"
    >
      <div className="container-fluid mx-auto max-w-full">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
          <motion.div 
            initial={{ x: -50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.8 }} 
            className="lg:w-1/2 space-y-6"
          >
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-indigo-100 mb-6">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span className="text-indigo-800 font-medium text-sm">Your gateway to premium Telegram communities</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Membify
            </h1>
            
            <p className="text-3xl font-medium text-indigo-900">
              Monetize your Telegram groups with ease ✨
            </p>
            
            <p className="text-xl text-slate-600 max-w-xl">
              Create, manage, and grow your paid Telegram communities with powerful subscription tools, automated user management, and insightful analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <>
                  {isAdmin ? (
                    <Button asChild size="lg" className="text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">
                      <Link to="/admin/dashboard" className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Admin Panel
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">
                      <Link to="/dashboard" className="flex items-center">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Button asChild variant="outline" size="lg" className="text-lg border-indigo-200 hover:bg-indigo-50 rounded-xl">
                      <Link to="/dashboard" className="flex items-center">
                        Group Owner Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md">
                    <Link to="/auth" className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="text-lg border-indigo-200 hover:bg-indigo-50 rounded-xl">
                    <Link to="/auth" className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ delay: 0.4, duration: 0.8 }} 
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden border border-indigo-50/50">
                <img 
                  alt="Membify Dashboard Preview" 
                  className="w-full h-auto" 
                  src="/lovable-uploads/a88423b8-cf0d-460e-9ab6-e37ba286f2a8.png" 
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
