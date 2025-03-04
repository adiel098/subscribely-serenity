
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/auth/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAdminPermission } from "@/auth/hooks/useAdminPermission";
import Navbar from "@/components/Navbar";
import { FeatureSection } from "@/main/components/landing/FeatureSection";
import { RevenueCalculator } from "@/main/components/landing/RevenueCalculator";
import { 
  ArrowRight, 
  Shield, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  CheckCircle,
  Globe,
  Zap, 
  Users, 
  BarChart,
  MessageCircle,
  CreditCard,
  Lock,
  Headset,
  Clock,
  RefreshCw,
  BadgeCheck
} from "lucide-react";

export default function Index() {
  const { user } = useAuth();
  const { isAdmin } = useAdminPermission();

  const managementFeatures = [
    { text: "Connect new and existing Telegram communities" },
    { text: "Accept free or paid Telegram members" },
    { text: "Customize and brand your invite page" },
    { text: "Embed payments directly on your website" }
  ];

  const paymentFeatures = [
    { text: "Stripe integration for global payments" },
    { text: "All major credit cards supported" },
    { text: "Apple Pay & Google Pay integration" },
    { text: "Wide range of Cryptocurrencies" }
  ];
  
  const monitorFeatures = [
    { text: "Easily track membership activity" },
    { text: "Monitor your most important metrics" },
    { text: "Quickly refund or cancel subscriptions" },
    { text: "Build automated workflows with integrations" }
  ];
  
  const supportFeatures = [
    { text: "Unlimited 24/7 support" },
    { text: "1-1 Configuration consultation" },
    { text: "99.99% Uptime guarantee" },
    { text: "Dedicated account manager" }
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
      
      {/* Feature Sections */}
      <FeatureSection
        title="Start & Grow 🚀"
        description="Membify gives you everything you need to build a thriving paid Telegram community. You focus on great content and growth, and we handle everything else, from invites to permissions and more."
        features={managementFeatures}
        imageSrc="/lovable-uploads/922e3de0-b097-4b2c-8e97-32aa579d045a.png"
        imageAlt="Community Management Platform"
        bgColor="bg-white"
      />
      
      <FeatureSection
        title="Get Paid Globally 💸"
        description="Enhance convenience and streamline payments with a flexible wide range of options on Membify."
        features={paymentFeatures}
        imageSrc="/lovable-uploads/9ffe418a-ad3f-4a1c-9576-89f7129a1b8f.png"
        imageAlt="Global Payment Options"
        bgColor="bg-green-50"
        reversed={true}
      />
      
      <FeatureSection
        title="Monitor & Manage 📊"
        description="Built-in member management features like billing and community analytics make administration a breeze, while your activity feed lets you keep your finger on the pulse of your community."
        features={monitorFeatures}
        imageSrc="/lovable-uploads/1fe01199-01ba-4d5d-9d6e-88af5097a5f0.png"
        imageAlt="Analytics Dashboard"
        bgColor="bg-white"
      />
      
      <FeatureSection
        title="Unparalleled Support 🎧"
        description="Our Customer Success team offers reliable and dedicated support to help you grow your membership business."
        features={supportFeatures}
        imageSrc="/lovable-uploads/d7b82bfb-6189-40c0-8cba-643eb0c03b4c.png"
        imageAlt="Customer Support"
        bgColor="bg-amber-50"
        reversed={true}
        buttonText="Get started for free"
      />
      
      {/* Revenue Calculator Section */}
      <RevenueCalculator />
      
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
