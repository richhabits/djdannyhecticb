import { useState } from "react";
import { Link, useLocation } from "wouter";
import { usePortalAuth, PortalRole } from "@/contexts/PortalAuthContext";
import { Zap, Eye, EyeOff, Mic, Building2, Music } from "lucide-react";

const ROLES: { value: PortalRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "booking_client",
    label: "Booking Client",
    description: "I want to book DJ Danny for my event",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    value: "artist",
    label: "Artist",
    description: "I'm an artist submitting tracks or mixes",
    icon: <Music className="w-5 h-5" />,
  },
  {
    value: "brand",
    label: "Brand",
    description: "I represent a brand or agency",
    icon: <Mic className="w-5 h-5" />,
  },
];

export default function PortalSignup() {
  const { register } = usePortalAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<PortalRole | null>(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    setError(null);
    const result = await register({ email, password, name, role, displayName: name, company: company || undefined });
    setLoading(false);
    if (result.success) {
      navigate("/portal/dashboard");
    } else {
      setError(result.error || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-[#f97316] flex items-center justify-center">
              <Zap className="w-7 h-7 text-black fill-black" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">Create Account</h1>
          <p className="text-white/50 text-sm mt-1 uppercase tracking-widest">Client Portal</p>
        </div>

        <div className="border-2 border-white/20 bg-black p-6">
          {step === "role" ? (
            <>
              <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">I am a...</h2>
              <div className="space-y-3">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => { setRole(r.value); setStep("details"); }}
                    className="w-full border-2 border-white/20 hover:border-[#f97316] p-4 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-white/50 group-hover:text-[#f97316] transition-colors">{r.icon}</div>
                      <div>
                        <div className="font-bold text-white text-sm uppercase tracking-widest">{r.label}</div>
                        <div className="text-white/40 text-xs mt-0.5">{r.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-white/40 text-sm mt-4">
                Already have an account?{" "}
                <Link href="/portal/login" className="text-[#f97316] hover:underline font-bold">Sign in</Link>
              </p>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("role")}
                className="text-white/40 text-xs uppercase tracking-widest hover:text-white mb-4 flex items-center gap-1"
              >
                ← Back
              </button>

              <div className="mb-4 p-2 border border-[#f97316]/30 bg-[#f97316]/5 text-xs text-[#f97316] uppercase tracking-widest font-bold">
                {ROLES.find(r => r.value === role)?.label}
              </div>

              {error && (
                <div className="mb-4 p-3 border-l-4 border-red-500 bg-red-500/10 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                    placeholder="Your full name"
                  />
                </div>

                {(role === "brand" || role === "booking_client") && (
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">
                      Company / Organisation
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
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
                      minLength={8}
                      className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none pr-10"
                      placeholder="Min. 8 characters"
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
                  className="w-full bg-[#f97316] text-black font-black uppercase tracking-widest py-3 text-sm hover:bg-orange-400 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="text-center text-white/40 text-sm mt-4">
                Already have an account?{" "}
                <Link href="/portal/login" className="text-[#f97316] hover:underline font-bold">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
