
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
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
