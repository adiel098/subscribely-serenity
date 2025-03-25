
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  icon,
  className
}) => {
  return (
    <motion.div 
      className={cn("mb-8", className)}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="p-3 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
            {React.cloneElement(icon as React.ReactElement, { 
              className: cn("h-8 w-8 text-indigo-600", (icon as React.ReactElement).props.className) 
            })}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="ml-auto">{actions}</div>
        )}
      </div>
    </motion.div>
  );
};
