import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

const PORTAL_ROLES = ["booking_client", "artist", "brand", "admin"];

export function PortalGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user || !PORTAL_ROLES.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Portal Access Required</h1>
          <p className="text-muted-foreground">Sign in to your client portal account to continue.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/portal/login">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600">Sign In</Button>
            </Link>
            <Link href="/portal/register">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
