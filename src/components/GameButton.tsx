import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GameButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "error";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GameButton = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  onClick,
  className 
}: GameButtonProps) => {
  const sizeClasses = {
    sm: "px-6 py-3 text-base",
    md: "px-8 py-4 text-lg",
    lg: "px-12 py-6 text-xl"
  };

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary", 
    success: "btn-success",
    error: "btn-error"
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed transform-none",
        className
      )}
    >
      {children}
    </Button>
  );
};