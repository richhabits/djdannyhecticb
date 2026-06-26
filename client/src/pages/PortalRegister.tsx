import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

const ROLES = [
  { value: "booking_client", label: "Booking Client" },
  { value: "artist", label: "Artist" },
  { value: "brand", label: "Brand" },
] as const;

export default function PortalRegister() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("booking_client");

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Account created!");
      navigate("/portal");
    },
    onError: (error) => {
      toast.error(error.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate({ email, password, name: name || undefined, role: role as "booking_client" | "artist" | "brand" });
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
          <h2 className="text-2xl font-bold mb-2">Client Portal Sign Up</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account to submit bookings, upload media, and track your work with us.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="role">I am a...</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" />
            </div>

            <Button type="submit" disabled={register.isPending} className="w-full bg-gradient-to-r from-orange-600 to-amber-600">
              {register.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/portal/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
