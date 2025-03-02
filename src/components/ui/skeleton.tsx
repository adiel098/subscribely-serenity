
import { cn } from "@/lib/utils"
import { CSSProperties } from "react"

function Skeleton({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { style?: CSSProperties }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted relative overflow-hidden",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        className
      )}
      style={style}
      {...props}
    />
  )
}

// Specialized skeleton for full-height loading screens
function FullScreenSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm h-[100vh] w-full">
      <Skeleton
        className={cn(
          "w-full max-w-md h-[80vh] rounded-xl bg-gradient-to-br from-purple-100/50 to-blue-100/50",
          className
        )}
        {...props}
      />
    </div>
  )
}

export { Skeleton, FullScreenSkeleton }
