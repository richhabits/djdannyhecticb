import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Music, Sparkles } from "lucide-react";

const GENRES = ["UKG", "House", "R&B", "Dancehall", "Grime", "Afrobeats", "Hip-Hop", "Jungle"];

export function HecticOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [aiMemoryEnabled, setAiMemoryEnabled] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const createProfile = trpc.profiles.createOrUpdate.useMutation({
    onSuccess: () => {
      localStorage.setItem("hectic-onboarding-complete", "true");
      // Also set dismissed if user checked "don't show again"
      if (dontShowAgain) {
        localStorage.setItem("hectic-onboarding-dismissed", "true");
      }
      setIsOpen(false);
      toast.success("Welcome to the Hectic Universe! You're locked in.");
    },
    onError: (error: unknown) => {
      console.error("[HecticOnboarding] Mutation error:", error);
      const message = error instanceof Error ? error.message : "Failed to save preferences";
      toast.error(message);
    },
  });

  useEffect(() => {
    const hasCompleted = localStorage.getItem("hectic-onboarding-complete");
    const isDismissed = localStorage.getItem("hectic-onboarding-dismissed");

    // Only show if user hasn't completed or dismissed it
    if (!hasCompleted && !isDismissed) {
      // Wait 3 seconds to let the page load first
      const timer = setTimeout(() => setIsOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem("hectic-onboarding-dismissed", "true");
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Dialog is being closed - check if "don't show again" was checked
      if (dontShowAgain) {
        localStorage.setItem("hectic-onboarding-dismissed", "true");
      }
    }
    setIsOpen(open);
  };

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre to get the best experience!");
      return;
    }

    createProfile.mutate({
      name: "Guest",
      genres: selectedGenres,
      whatsappOptIn,
      aiMemoryEnabled,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl glass-premium border-accent/20 p-8 rounded-3xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        <DialogHeader className="space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-black text-center tracking-tighter uppercase italic">
            Welcome to the <span className="gradient-text">Hectic</span> Universe
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-white/70">
            Tell us your vibe so we can personalize your journey with Danny and the crew.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Genres */}
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase tracking-widest text-accent/80 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Pick Your Sound
            </Label>
            <div className="flex flex-wrap gap-2 justify-center">
              {GENRES.map((genre) => {
                const isActive = selectedGenres.includes(genre);
                return (
                  <Button
                    key={genre}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`rounded-full px-6 py-5 h-auto transition-all duration-300 ${isActive
                        ? "bg-accent text-white border-accent shadow-[0_0_20px_rgba(255,77,0,0.3)] scale-105"
                        : "bg-white/5 hover:bg-white/10 hover:border-accent/40"
                      }`}
                    onClick={() => {
                      setSelectedGenres((prev) =>
                        prev.includes(genre)
                          ? prev.filter((g) => g !== genre)
                          : [...prev, genre]
                      );
                    }}
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 gap-4 bg-white/5 p-6 rounded-2xl border border-white/5">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setWhatsappOptIn(!whatsappOptIn)}>
              <Checkbox
                id="whatsappOptIn"
                checked={whatsappOptIn}
                onCheckedChange={(checked) => setWhatsappOptIn(checked === true)}
                className="border-accent/40 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor="whatsappOptIn" className="text-sm font-medium text-white/80 cursor-pointer group-hover:text-white transition-colors">
                I'm cool with WhatsApp updates about shows & exclusive content
              </Label>
            </div>
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setAiMemoryEnabled(!aiMemoryEnabled)}>
              <Checkbox
                id="aiMemoryEnabled"
                checked={aiMemoryEnabled}
                onCheckedChange={(checked) => setAiMemoryEnabled(checked === true)}
                className="border-accent/40 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor="aiMemoryEnabled" className="text-sm font-medium text-white/80 cursor-pointer group-hover:text-white transition-colors">
                Enable AI Danny memory (he'll remember our conversations)
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 px-2">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) => setDontShowAgain(checked === true)}
                className="border-white/20"
              />
              <Label htmlFor="dontShowAgain" className="text-xs text-white/50 cursor-pointer hover:text-white/70">
                Don't show this onboarding again
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="ghost"
                className="flex-1 text-white/50 hover:text-white hover:bg-white/5 h-12 rounded-xl"
                onClick={handleDismiss}
              >
                Skip for now
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedGenres.length === 0 || createProfile.isPending}
                className="flex-[1.5] gradient-bg text-white font-bold h-12 rounded-xl shadow-lg active:scale-95 transition-all duration-200"
              >
                {createProfile.isPending ? "Setting up..." : "Lock In!"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

