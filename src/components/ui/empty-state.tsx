
import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-gray-500">{description}</p>
      )}
      {action}
    </div>
  );
};
