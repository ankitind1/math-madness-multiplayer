import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
  onTick?: (timeLeft: number) => void;
}

export const Timer = ({ duration, onTimeUp, isActive, onTick }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
    }
  }, [isActive, duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        onTick?.(newTime);
        
        if (newTime <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTick]);

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