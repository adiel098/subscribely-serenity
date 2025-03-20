
import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
  gradient?: "purple" | "blue" | "green";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  description,
  className,
  gradient = "purple"
}) => {
  const gradientClasses = {
    purple: "from-indigo-500 via-purple-600 to-pink-500",
    blue: "from-blue-400 via-indigo-500 to-purple-600",
    green: "from-emerald-400 via-teal-500 to-cyan-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative mb-6 overflow-hidden rounded-xl p-4", 
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r opacity-10" />
      
      <div className="relative z-10 flex items-start gap-3">
        <div className={`rounded-full bg-gradient-to-br ${gradientClasses[gradient]} p-2.5 text-white shadow-lg`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <h2 className={`bg-gradient-to-r ${gradientClasses[gradient]} bg-clip-text text-xl font-bold text-transparent`}>
            {title}
          </h2>
          
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80"
        style={{ 
          backgroundImage: `linear-gradient(to right, transparent, 
            var(--gradient-start, #8B5CF6), 
            var(--gradient-middle, #D946EF), 
            var(--gradient-end, #EC4899), 
            transparent)`,
        }}
      />
    </motion.div>
  );
};
