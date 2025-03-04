
import { useState } from 'react';
import { useAuth } from '@/auth/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogIn, 
  UserPlus, 
  Sparkles,
  Zap,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MainHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white/90 shadow-sm backdrop-blur-sm flex items-center justify-between px-6">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center gap-3"
      >
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500 drop-shadow-sm" /> 
          <span className="font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Membify
          </span>
        </Link>
        <nav className="ml-8 hidden md:flex space-x-1">
          {[
            { name: "Features", path: "/features", icon: Zap },
            { name: "Pricing", path: "/pricing", icon: Heart },
            { name: "About", path: "/about" }
          ].map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={item.path}
                className="text-indigo-700 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 hover:bg-indigo-200/50 transition-colors"
              >
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                <span>{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-300 shadow-md"
            >
              Dashboard
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-indigo-700 hover:bg-indigo-200/50"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </header>
  );
}
