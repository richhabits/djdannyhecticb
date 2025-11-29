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

  const createProfile = trpc.profiles.createOrUpdate.useMutation({
    onSuccess: () => {
      localStorage.setItem("hectic-onboarding-complete", "true");
      setIsOpen(false);
      toast.success("Welcome to the Hectic Universe! You're locked in.");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to save preferences";
      toast.error(message);
    },
  });

  useEffect(() => {
    const hasCompleted = localStorage.getItem("hectic-onboarding-complete");
    if (!hasCompleted) {
      // Show after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      toast.error("Please select at least one genre");
      return;
    }

    createProfile.mutate({
      name: "Guest", // Will be updated when they send a shout
      genres: selectedGenres,
      whatsappOptIn,
      aiMemoryEnabled,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Welcome to the Hectic Universe
          </DialogTitle>
          <DialogDescription>
            Let's get you locked in! Tell us your vibe so we can personalize your experience.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Genres */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Music className="w-5 h-5" />
              What genres are you feeling? *
            </Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <Button
                  key={genre}
                  type="button"
                  variant={selectedGenres.includes(genre) ? "default" : "outline"}
                  size="sm"
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
              ))}
            </div>
          </div>

          {/* Opt-ins */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="whatsappOptIn"
                checked={whatsappOptIn}
                onCheckedChange={(checked) => setWhatsappOptIn(checked === true)}
              />
              <Label htmlFor="whatsappOptIn" className="text-sm font-normal cursor-pointer">
                I'm cool with WhatsApp updates about shows and exclusive content
              </Label>
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="aiMemoryEnabled"
                checked={aiMemoryEnabled}
                onCheckedChange={(checked) => setAiMemoryEnabled(checked === true)}
              />
              <Label htmlFor="aiMemoryEnabled" className="text-sm font-normal cursor-pointer">
                Enable AI Danny memory (so he remembers our conversations)
              </Label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Skip for now
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedGenres.length === 0 || createProfile.isPending}
              className="gradient-bg"
            >
              {createProfile.isPending ? "Setting up..." : "Lock In!"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

