import { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  variant?: "particles" | "gradient" | "waves" | "grid";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function AnimatedBackground({
  variant = "particles",
  intensity = "medium",
  className = "",
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant !== "particles" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particleCount = intensity === "low" ? 30 : intensity === "medium" ? 50 : 80;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${intensity === "low" ? 0.1 : intensity === "medium" ? 0.2 : 0.3})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [variant, intensity]);

  if (variant === "particles") {
    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none ${className}`}
      />
    );
  }

  if (variant === "gradient") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          background: `linear-gradient(135deg, 
            rgba(139, 92, 246, 0.1) 0%, 
            rgba(236, 72, 153, 0.1) 50%, 
            rgba(251, 146, 60, 0.1) 100%)`,
          animation: "gradientShift 15s ease infinite",
        }}
      />
    );
  }

  if (variant === "waves") {
    return (
      <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
          <path
            d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
            fill="rgba(139, 92, 246, 0.05)"
            style={{
              animation: "wave 10s ease-in-out infinite",
            }}
          />
          <path
            d="M0,450 Q300,350 600,450 T1200,450 L1200,800 L0,800 Z"
            fill="rgba(236, 72, 153, 0.05)"
            style={{
              animation: "wave 12s ease-in-out infinite reverse",
            }}
          />
        </svg>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          animation: "gridMove 20s linear infinite",
        }}
      />
    );
  }

  return null;
}
