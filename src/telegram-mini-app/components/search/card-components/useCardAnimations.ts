
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
        duration: 0.5,
        delay: animationDelay,
        ease: "easeOut" 
      }
    },
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.15)",
      transition: { duration: 0.3 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  }), [animationDelay]);

  const buttonVariants: Variants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        yoyo: Infinity,
        duration: 0.8,
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
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 2,
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
