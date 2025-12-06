import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EnhancedCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "gradient" | "glass";
  hover?: boolean;
}

export function EnhancedCard({
  children,
  className,
  variant = "default",
  hover = true,
}: EnhancedCardProps) {
  const variantClasses = {
    default: "card-enhanced",
    gradient: "card-gradient",
    glass: "glass",
  };

  return (
    <Card
      className={cn(
        variantClasses[variant],
        hover && "hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1",
        "transition-all duration-300",
        className
      )}
    >
      {children}
    </Card>
  );
}
