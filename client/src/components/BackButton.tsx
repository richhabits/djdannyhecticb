import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}

export function BackButton({ to, label = "Back", className = "" }: BackButtonProps) {
  const [, navigate] = useLocation();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`tape-strip bg-accent text-white border-white hover:bg-white hover:text-black transition-all flex items-center gap-2 px-4 py-2 ${className}`}
      title={label}
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
