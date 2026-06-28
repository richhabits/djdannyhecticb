import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        setIsLoading(false);
        return;
      }

      toast.success("Logged in successfully!");
      // Redirect to admin control or dashboard
      window.location.href = "/admin/control";
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Server issues the OAuth URL with a CSRF state token bound to a short-lived cookie
    window.location.href = "/api/auth/google/login";
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900/10 via-background to-amber-900/10 -z-10" />

      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 smooth-transition">
              <Music className="w-12 h-12 text-accent" />
              <span className="text-3xl font-bold">DJ Danny Hectic B</span>
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="gradient-text">Welcome Back</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Sign in to access exclusive mixes, book events, and connect with the community.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                <span className="text-2xl">🎵</span>
                <span className="text-sm font-semibold">1000+ Mixes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                <span className="text-2xl">🎉</span>
                <span className="text-sm font-semibold">Live Events</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass">
                <span className="text-2xl">👥</span>
                <span className="text-sm font-semibold">5K+ Members</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <Card className="p-8 glass hover-lift">
            <h2 className="text-2xl font-bold mb-2">Admin Sign In</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Booking client, artist or brand?{" "}
              <Link href="/portal/login" className="text-accent hover:underline">
                Use the client portal instead
              </Link>
              .
            </p>

            {/* Email + Password */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            {/* Privacy Notice */}
            <p className="text-xs text-muted-foreground text-center mt-6">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
