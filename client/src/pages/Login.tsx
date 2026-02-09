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

  const handleOAuthLogin = (provider: string) => {
    toast.info(`Redirecting to ${provider}...`);
    // In production, this would redirect to OAuth provider
    setTimeout(() => {
      toast.success(`Connected with ${provider}!`);
      window.location.href = "/dashboard";
    }, 2000);
  };

  const oauthProviders = [
    {
      name: "Google",
      icon: "🔍",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700"
    },
    {
      name: "Facebook",
      icon: "📘",
      color: "from-orange-600 to-orange-700",
      hoverColor: "hover:from-orange-700 hover:to-orange-800"
    },
    {
      name: "Apple",
      icon: "🍎",
      color: "from-gray-800 to-black",
      hoverColor: "hover:from-gray-900 hover:to-black"
    },
    {
      name: "TikTok",
      icon: "🎬",
      color: "from-black to-gray-900",
      hoverColor: "hover:from-gray-900 hover:to-black"
    },
    {
      name: "Snapchat",
      icon: "👻",
      color: "from-yellow-400 to-yellow-500",
      hoverColor: "hover:from-yellow-500 hover:to-yellow-600"
    },
    {
      name: "Spotify",
      icon: "🎵",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:from-green-600 hover:to-green-700"
    },
    {
      name: "Instagram",
      icon: "📸",
      color: "from-amber-500 to-orange-600",
      hoverColor: "hover:from-amber-600 hover:to-orange-700"
    },
    {
      name: "Twitter/X",
      icon: "🐦",
      color: "from-orange-400 to-orange-500",
      hoverColor: "hover:from-orange-500 hover:to-orange-600"
    },
    {
      name: "Discord",
      icon: "💬",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700"
    },
    {
      name: "Twitch",
      icon: "🎮",
      color: "from-orange-500 to-orange-600",
      hoverColor: "hover:from-orange-600 hover:to-orange-700"
    },
    {
      name: "LinkedIn",
      icon: "💼",
      color: "from-orange-700 to-orange-800",
      hoverColor: "hover:from-orange-800 hover:to-orange-900"
    },
    {
      name: "GitHub",
      icon: "⚡",
      color: "from-gray-700 to-gray-800",
      hoverColor: "hover:from-gray-800 hover:to-gray-900"
    },
  ];

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
            <h2 className="text-2xl font-bold mb-6">Sign In</h2>

            {/* OAuth Providers */}
            <div className="space-y-3 mb-6">
              <p className="text-sm text-muted-foreground mb-4">Continue with:</p>
              <div className="grid grid-cols-2 gap-3">
                {oauthProviders.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleOAuthLogin(provider.name)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r ${provider.color} ${provider.hoverColor} text-white font-semibold smooth-transition hover-lift`}
                  >
                    <span className="text-xl">{provider.icon}</span>
                    <span className="text-sm">{provider.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-lg bg-input border border-border focus:outline-none focus:ring-2 focus:ring-accent smooth-transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground smooth-transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  <span className="text-sm text-muted-foreground">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-bg py-6 text-lg font-semibold hover-lift"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent font-semibold hover:underline">
                Sign up for free
              </Link>
            </p>

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
