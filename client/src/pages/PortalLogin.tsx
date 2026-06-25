import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";

export default function PortalLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      toast.success("Welcome back!");
      await utils.auth.me.invalidate();
      navigate("/portal");
    },
    onError: (error) => {
      toast.error(error.message || "Login failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-br from-orange-900/10 via-background to-amber-900/10 -z-10" />

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 smooth-transition">
          <Music className="w-10 h-10 text-accent" />
          <span className="text-2xl font-bold">DJ Danny Hectic B</span>
        </Link>

        <Card className="p-8 glass hover-lift">
          <h2 className="text-2xl font-bold mb-6">Client Portal Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>

            <Button type="submit" disabled={login.isPending} className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/portal/register" className="text-accent hover:underline">Sign up</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
