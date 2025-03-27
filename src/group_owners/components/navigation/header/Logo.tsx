
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }} 
      className="flex items-center"
    >
      <Link to="/dashboard" className="text-sm md:text-xl font-bold flex items-center gap-1 md:gap-2">
        <Crown className="h-4 w-4 md:h-6 md:w-6 text-amber-500 drop-shadow-sm" /> 
        <span className="font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent">
          Membify
        </span>
      </Link>
    </motion.div>
  );
}
