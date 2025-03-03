
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface ConfettiEffectProps {
  duration?: number;
}

export const ConfettiEffect = ({ duration = 3000 }: ConfettiEffectProps) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Trigger confetti effect when component mounts
    if (showConfetti) {
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#5EEAD4', '#0EA5E9', '#8B5CF6']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#5EEAD4', '#0EA5E9', '#8B5CF6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Clean up confetti after animation
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [showConfetti, duration]);

  return null; // This component doesn't render anything visible
};
