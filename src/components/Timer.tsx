import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  onTick?: (timeLeft: number) => void;
  startTime?: number; // epoch milliseconds for absolute timing
}

export const Timer = ({ duration, onTimeUp, isActive, onTick, startTime }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const animationRef = useRef<number>();
  const hasCalledTimeUp = useRef(false);

  useEffect(() => {
    hasCalledTimeUp.current = false;
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) {
      hasCalledTimeUp.current = false;
      return;
    }

    // If no startTime provided, use interval-based timer (fallback)
    if (!startTime) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          onTick?.(newTime);
          
          if (newTime <= 0 && !hasCalledTimeUp.current) {
            hasCalledTimeUp.current = true;
            clearInterval(interval);
            onTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }

    // Absolute time-based countdown using requestAnimationFrame
    const tick = () => {
      const now = Date.now();
      const elapsedMs = now - startTime;
      const remaining = Math.max(0, duration - Math.floor(elapsedMs / 1000));
      
      setTimeLeft(remaining);
      onTick?.(remaining);
      
      if (remaining <= 0 && !hasCalledTimeUp.current) {
        hasCalledTimeUp.current = true;
        onTimeUp();
      } else if (remaining > 0) {
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    // Start the animation loop
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, startTime, onTimeUp, onTick]);

  const percentage = (timeLeft / duration) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className={cn(
        "text-6xl font-bold transition-all duration-300",
        isCritical && "text-destructive animate-pulse",
        isLow && !isCritical && "text-accent",
        !isLow && "text-primary"
      )}>
        {timeLeft}
      </div>
      
      <div className="w-full max-w-md bg-muted rounded-full h-3 overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-full",
            isCritical && "bg-gradient-to-r from-destructive to-destructive-glow",
            isLow && !isCritical && "bg-gradient-to-r from-accent to-accent-glow",
            !isLow && "bg-gradient-to-r from-primary to-primary-glow"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};