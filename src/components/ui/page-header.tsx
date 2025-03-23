import React from "react";
import { cn } from "@/lib/utils";
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
  return <div className={cn("mb-8", className)}>
      
    </div>;
};