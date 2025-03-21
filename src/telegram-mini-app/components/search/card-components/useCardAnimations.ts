
import { useMemo } from "react";
import { Variants } from "framer-motion";

export const useCardAnimations = (animationDelay = 0) => {
  const cardVariants = useMemo<Variants>(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3, // Faster animation
        delay: animationDelay,
        ease: "easeOut" 
      }
    },
    hover: { 
      scale: 1.01, // Reduce hover scale
      boxShadow: "0 4px 12px -2px rgba(124, 58, 237, 0.12)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.99, // Less dramatic tap scale
      transition: { duration: 0.1 }
    }
  }), [animationDelay]);

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02, // Smaller scale for buttons
      transition: { 
        yoyo: Infinity,
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };
  
  const sparkleVariants: Variants = {
    initial: { 
      scale: 1,
      rotate: 0 
    },
    animate: { 
      scale: [1, 1.05, 1], // Reduce scale range
      rotate: [0, 3, -3, 0], // Reduce rotation range
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return {
    cardVariants,
    buttonVariants,
    sparkleVariants
  };
};
