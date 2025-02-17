
import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/features/community/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  pageCount: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  className,
  pageCount,
  page,
  onPageChange,
  ...props
}: PaginationProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-6 lg:space-x-8", className)} {...props}>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Go to previous page</span>
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Go to next page</span>
        </Button>
      </div>
    </div>
  )
}
