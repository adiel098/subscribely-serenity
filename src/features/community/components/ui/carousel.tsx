import * as React from "react"
import * as CarouselPrimitive from "@radix-ui/react-carousel"
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/features/community/components/ui/button"

const Carousel = CarouselPrimitive.Root

const CarouselViewport = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <CarouselPrimitive.Viewport
    ref={ref}
    className={cn("overflow-hidden w-full", className)}
    {...props}
  />
))
CarouselViewport.displayName = CarouselPrimitive.Viewport.displayName

const CarouselContent = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Content>
>(({ className, ...props }, ref) => (
  <CarouselPrimitive.Content
    ref={ref}
    className={cn(
      "flex gap-1 overflow-hidden",
      className
    )}
    {...props}
  />
))
CarouselContent.displayName = CarouselPrimitive.Content.displayName

const CarouselItem = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CarouselPrimitive.Item
    ref={ref}
    className={cn("w-full flex-[0_0_auto]", className)}
    {...props}
  />
))
CarouselItem.displayName = CarouselPrimitive.Item.displayName

const CarouselPrevious = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Prev>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Prev>
>(({ className, ...props }, ref) => (
  <div className="relative w-[40px] h-[40px]">
  <CarouselPrimitive.Prev
    ref={ref}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "icon",
      }),
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="sr-only">Previous slide</span>
  </CarouselPrimitive.Prev>
  </div>
))
CarouselPrevious.displayName = CarouselPrimitive.Prev.displayName

const CarouselNext = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Next>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Next>
>(({ className, ...props }, ref) => (
  <div className="relative w-[40px] h-[40px]">
  <CarouselPrimitive.Next
    ref={ref}
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "icon",
      }),
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full",
      className
    )}
    {...props}
  >
    <ChevronRight className="h-4 w-4" />
    <span className="sr-only">Next slide</span>
  </CarouselPrimitive.Next>
  </div>
))
CarouselNext.displayName = CarouselPrimitive.Next.displayName

export {
  Carousel,
  CarouselViewport,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
