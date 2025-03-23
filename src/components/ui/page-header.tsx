
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm border border-indigo-100">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none text-gray-900 mb-1.5">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex-shrink-0 flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>;
};
