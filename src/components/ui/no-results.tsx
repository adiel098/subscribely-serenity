import React from "react";
import { SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";
import { Button } from "./button";

interface NoResultsProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const NoResults: React.FC<NoResultsProps> = ({
  title = "No results found",
  description = "We couldn't find any matches for your search. Try adjusting your filters or search terms.",
  icon = <SearchX size={32} className="text-gray-400" />,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={
        actionLabel && onAction ? (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null
      }
      className={cn("my-16", className)}
    />
  );
};
