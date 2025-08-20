import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  glow?: boolean;
  className?: string;
}

export const GameCard = ({ children, glow = false, className }: GameCardProps) => {
  return (
    <div className={cn(
      glow ? "game-card-glow" : "game-card",
      className
    )}>
      {children}
    </div>
  );
};