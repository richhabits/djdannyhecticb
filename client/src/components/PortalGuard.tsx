import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { usePortalAuth } from "@/contexts/PortalAuthContext";

export function PortalGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = usePortalAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/portal/login");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/30 text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
