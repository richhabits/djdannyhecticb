import { useState } from "react";
import { Link, useLocation } from "wouter";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function PortalLogin() {
  const { login } = usePortalAuth();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/portal/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#f97316] flex items-center justify-center">
              <Zap className="w-7 h-7 text-black fill-black" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Client Portal</h1>
          <p className="text-white/50 text-sm mt-1 uppercase tracking-widest">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="border-2 border-white/20 bg-black p-6">
          {error && (
            <div className="mb-4 p-3 border-l-4 border-red-500 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f97316] text-black font-black uppercase tracking-widest py-3 text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-4">
            Don't have an account?{" "}
            <Link href="/portal/signup" className="text-[#f97316] hover:underline font-bold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
