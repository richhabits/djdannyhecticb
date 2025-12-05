import { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================
// SKELETON SCREENS
// ============================================

// Card skeleton with customizable content
export function CardSkeleton({ 
  hasImage = true,
  hasTitle = true,
  hasDescription = true,
  hasButton = false,
  className
}: {
  hasImage?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  hasButton?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn("p-6 space-y-4", className)}>
      {hasImage && <Skeleton className="aspect-video w-full rounded-lg" />}
      {hasTitle && <Skeleton className="h-6 w-3/4" />}
      {hasDescription && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}
      {hasButton && <Skeleton className="h-10 w-32" />}
    </Card>
  );
}

// List item skeleton
export function ListItemSkeleton({ 
  hasAvatar = true,
  lines = 2 
}: { 
  hasAvatar?: boolean;
  lines?: number;
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      {hasAvatar && <Skeleton className="w-12 h-12 rounded-full" />}
      <div className="flex-1 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-4", i === 0 ? "w-1/3" : "w-2/3")} />
        ))}
      </div>
    </div>
  );
}

// Grid skeleton
export function GridSkeleton({ 
  count = 6, 
  columns = 3,
  hasImage = true 
}: { 
  count?: number; 
  columns?: number;
  hasImage?: boolean;
}) {
  return (
    <div className={cn(
      "grid gap-6",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} hasImage={hasImage} />
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-border p-4 flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </Card>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}

// ============================================
// LOADING STATES
// ============================================

export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={cn(
        "border-2 border-accent/20 border-t-accent rounded-full animate-spin",
        sizeClasses[size]
      )} />
    </div>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1 p-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-accent rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

export function LoadingPulse({ children }: { children: ReactNode }) {
  return (
    <div className="animate-pulse">{children}</div>
  );
}

// ============================================
// ANIMATED BACKGROUNDS
// ============================================

export function AnimatedGradientBg({ 
  children,
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 animate-gradient" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function ParticleBackground({ className }: { className?: string }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${5 + Math.random() * 10}s`,
    size: `${2 + Math.random() * 4}px`,
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-accent/20 animate-float"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// ENHANCED CARDS
// ============================================

export function GlassCard({ 
  children, 
  className,
  hover = true 
}: { 
  children: ReactNode; 
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl",
      hover && "transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl",
      className
    )}>
      {children}
    </div>
  );
}

export function GradientCard({ 
  children, 
  className,
  gradientFrom = "from-purple-500",
  gradientTo = "to-pink-500"
}: { 
  children: ReactNode; 
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  return (
    <div className={cn(
      "relative rounded-xl overflow-hidden",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10",
        gradientFrom,
        gradientTo
      )} />
      <div className={cn(
        "absolute inset-[1px] bg-card rounded-xl",
      )} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================
// ANIMATED BUTTONS
// ============================================

export function ShimmerButton({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-semibold text-white",
        "bg-gradient-to-r from-purple-600 to-pink-600",
        "transition-all duration-300 hover:scale-105",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
    </button>
  );
}

export function PulseButton({ 
  children, 
  className,
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "relative rounded-lg px-6 py-3 font-semibold text-white",
        "bg-accent",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 rounded-lg bg-accent animate-ping opacity-25" />
    </button>
  );
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

export function FadeInOnScroll({ 
  children,
  delay = 0,
  direction = "up",
  className
}: { 
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const directionClasses = {
    up: "animate-fade-in-up",
    down: "animate-fade-in-down",
    left: "animate-fade-in-left",
    right: "animate-fade-in-right",
  };

  return (
    <div 
      className={cn(
        "opacity-0",
        directionClasses[direction],
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {children}
    </div>
  );
}

// ============================================
// HOVER EFFECTS
// ============================================

export function TiltCard({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string;
}) {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)";
  };

  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// ============================================
// TYPOGRAPHY
// ============================================

export function GradientText({ 
  children, 
  className,
  from = "from-purple-500",
  to = "to-pink-500"
}: { 
  children: ReactNode; 
  className?: string;
  from?: string;
  to?: string;
}) {
  return (
    <span className={cn(
      "bg-gradient-to-r bg-clip-text text-transparent",
      from,
      to,
      className
    )}>
      {children}
    </span>
  );
}

export function AnimatedText({ 
  children, 
  className 
}: { 
  children: string; 
  className?: string;
}) {
  return (
    <span className={cn("inline-flex", className)}>
      {children.split("").map((char, i) => (
        <span
          key={i}
          className="animate-wave"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

// ============================================
// DIVIDERS
// ============================================

export function GlowDivider({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-px", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm" />
    </div>
  );
}

export function WaveDivider({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <div className={cn("w-full overflow-hidden", flip && "rotate-180", className)}>
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="w-full h-12 fill-current text-background"
      >
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
      </svg>
    </div>
  );
}

export default {
  CardSkeleton,
  ListItemSkeleton,
  GridSkeleton,
  TableSkeleton,
  ProfileSkeleton,
  LoadingSpinner,
  LoadingDots,
  LoadingPulse,
  AnimatedGradientBg,
  ParticleBackground,
  GlassCard,
  GradientCard,
  ShimmerButton,
  PulseButton,
  FadeInOnScroll,
  TiltCard,
  GradientText,
  AnimatedText,
  GlowDivider,
  WaveDivider,
};
