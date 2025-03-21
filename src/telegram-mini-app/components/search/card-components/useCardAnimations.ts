
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
        duration: 0.4,
        delay: animationDelay,
        ease: "easeOut" 
      }
    },
    hover: { 
      scale: 1.02,
      boxShadow: "0 8px 20px -5px rgba(124, 58, 237, 0.15)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }), [animationDelay]);

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
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
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
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
