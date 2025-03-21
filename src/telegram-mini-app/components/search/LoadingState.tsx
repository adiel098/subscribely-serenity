
import React from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const LoadingState: React.FC = () => {
  // Shimmer effect animation
  const shimmer = {
    hidden: { backgroundPosition: "200% 0" },
    animate: { 
      backgroundPosition: ["-200%", "200%"],
      transition: {
        repeat: Infinity,
        duration: 2.5,
        ease: "linear"
      }
    }
  };

  // Container variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  // Card variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      } 
    }
  };

  // Create array with 3 elements for skeleton cards
  const skeletonCards = Array(3).fill(0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full px-4 py-2"
    >
      {skeletonCards.map((_, i) => (
        <motion.div 
          key={i}
          variants={cardVariants}
          className="w-full"
        >
          <Card className="mb-3 overflow-hidden border border-purple-100 w-full mx-auto">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <motion.div
                  variants={shimmer}
                  initial="hidden"
                  animate="animate"
                  style={{
                    backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                    backgroundSize: "200% 100%"
                  }}
                >
                  <Skeleton className="h-12 w-12 rounded-full bg-purple-100/60" />
                </motion.div>
                <div className="space-y-2 flex-1">
                  <motion.div
                    variants={shimmer}
                    initial="hidden"
                    animate="animate"
                    style={{
                      backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                      backgroundSize: "200% 100%"
                    }}
                  >
                    <Skeleton className="h-5 w-32 bg-purple-100/60" />
                  </motion.div>
                  <motion.div
                    variants={shimmer}
                    initial="hidden"
                    animate="animate"
                    style={{
                      backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                      backgroundSize: "200% 100%"
                    }}
                  >
                    <Skeleton className="h-3 w-24 bg-purple-100/60" />
                  </motion.div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <motion.div
                variants={shimmer}
                initial="hidden"
                animate="animate"
                style={{
                  backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                  backgroundSize: "200% 100%"
                }}
              >
                <Skeleton className="h-4 w-full my-1 bg-purple-100/60" />
              </motion.div>
              <motion.div
                variants={shimmer}
                initial="hidden"
                animate="animate"
                style={{
                  backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                  backgroundSize: "200% 100%",
                  delay: 0.2
                }}
              >
                <Skeleton className="h-4 w-4/5 bg-purple-100/60" />
              </motion.div>
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <motion.div
                variants={shimmer}
                initial="hidden"
                animate="animate"
                style={{
                  backgroundImage: "linear-gradient(90deg, rgba(238,238,238,0) 0%, rgba(238,238,238,0.8) 50%, rgba(238,238,238,0) 100%)",
                  backgroundSize: "200% 100%"
                }}
                className="w-full"
              >
                <Skeleton className="h-8 w-full bg-purple-100/60 rounded-md" />
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// A version of LoadingState that takes up more vertical space for fullscreen views
export const FullscreenLoadingState: React.FC = () => {
  return (
    <div className="w-full min-h-[100vh] px-4 py-8 flex flex-col justify-center">
      <div className="py-4">
        <Skeleton className="h-8 w-32 mx-auto mb-8 bg-purple-100/60 rounded-lg" />
      </div>
      {Array(4).fill(0).map((_, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          className="w-full"
        >
          <Card className="mb-4 overflow-hidden border border-purple-100 w-full mx-auto shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-full bg-purple-100/60" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-36 bg-purple-100/60" />
                  <Skeleton className="h-4 w-28 bg-purple-100/60" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-5 w-full my-1 bg-purple-100/60" />
              <Skeleton className="h-5 w-full my-1 bg-purple-100/60" />
              <Skeleton className="h-5 w-4/5 bg-purple-100/60" />
            </CardContent>
            <CardFooter className="pt-2 flex justify-between">
              <Skeleton className="h-5 w-24 bg-purple-100/60" />
              <Skeleton className="h-9 w-9 rounded-full bg-purple-100/60" />
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
