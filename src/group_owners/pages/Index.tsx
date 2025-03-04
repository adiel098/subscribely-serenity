
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminPermission } from "@/auth/hooks/useAdminPermission";
import Navbar from "@/components/Navbar";
import { 
  ArrowRight, 
  Shield, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  Zap, 
  Users, 
  BarChart,
  MessageCircle,
  CreditCard,
  Lock
} from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();

  const features = [
    {
      icon: <CreditCard className="h-10 w-10 text-indigo-500" />,
      title: "Subscription Management",
      description: "Create and manage paid memberships for your Telegram groups with ease."
    },
    {
      icon: <Users className="h-10 w-10 text-pink-500" />,
      title: "Automated User Management",
      description: "Automatically add or remove users based on payment status."
    },
    {
      icon: <BarChart className="h-10 w-10 text-purple-500" />,
      title: "Analytics Dashboard",
      description: "Get detailed insights about your subscribers and revenue."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-cyan-500" />,
      title: "Broadcast Messages",
      description: "Easily communicate with your subscribers through broadcasts."
    },
    {
      icon: <Zap className="h-10 w-10 text-amber-500" />,
      title: "Multiple Payment Methods",
      description: "Accept payments via Stripe, PayPal, and cryptocurrency."
    },
    {
      icon: <Lock className="h-10 w-10 text-emerald-500" />,
      title: "Secure Access Control",
      description: "Set custom access levels for different subscription tiers."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
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
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-75"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-50">
                  <img 
                    src="/lovable-uploads/5763dacb-9a17-4a52-8be0-a56b994b6c44.png" 
                    alt="Membify Dashboard Preview" 
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Features Section */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ✨ Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, manage, and monetize your Telegram communities
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-6 inline-block p-4 bg-gray-50 rounded-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-8 lg:px-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to monetize your Telegram community? 🚀
            </h2>
            <p className="text-xl text-white/90">
              Join thousands of community owners already using Membify to turn their passion into profit.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button asChild size="lg" className="text-lg bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700 rounded-xl shadow-md">
                <Link to="/auth">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg border-white text-white hover:bg-white/10 rounded-xl">
                <a href="https://t.me/membifybot" target="_blank" rel="noopener noreferrer">
                  Contact Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-4 sm:px-8 lg:px-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-indigo-400" />
                <span className="text-2xl font-bold">Membify</span>
              </div>
              <p className="text-gray-400 mt-2">
                © {new Date().getFullYear()} Membify. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
