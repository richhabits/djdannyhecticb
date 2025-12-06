import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Music, Headphones, Radio } from "lucide-react";

const GENRES = [
  "UK Garage",
  "House",
  "Soulful House",
  "Funky House",
  "Grime",
  "Amapiano",
  "Bassline",
  "Drum & Bass",
  "Hip Hop",
  "R&B",
];

export function UserPreferencesForm() {
  const { isAuthenticated } = useAuth();
  const { data: preferences, isLoading } = trpc.preferences.get.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const updatePreferences = trpc.preferences.update.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved!");
    },
  });

  const [musicTaste, setMusicTaste] = useState<string[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState<string>("");
  const [deviceType, setDeviceType] = useState<string>("");

  useEffect(() => {
    if (preferences) {
      setMusicTaste(
        preferences.musicTaste ? JSON.parse(preferences.musicTaste) : []
      );
      setFavoriteArtists(
        preferences.favoriteArtists
          ? JSON.parse(preferences.favoriteArtists).join(", ")
          : ""
      );
      setDeviceType(preferences.deviceType || "");
    }
  }, [preferences]);

  const handleGenreToggle = (genre: string) => {
    setMusicTaste((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSave = () => {
    updatePreferences.mutate({
      musicTaste,
      favoriteArtists: favoriteArtists
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      deviceType,
    });
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Please log in to manage your preferences
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return <Card className="p-6">Loading preferences...</Card>;
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Music Preferences</h2>
        <p className="text-muted-foreground">
          Help us personalize your experience
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold mb-3 block">
            Favorite Genres
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GENRES.map((genre) => (
              <div
                key={genre}
                className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleGenreToggle(genre)}
              >
                <Checkbox
                  checked={musicTaste.includes(genre)}
                  onCheckedChange={() => handleGenreToggle(genre)}
                />
                <Label className="cursor-pointer flex-1">{genre}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="artists" className="text-base font-semibold mb-2 block">
            Favorite Artists (comma-separated)
          </Label>
          <Input
            id="artists"
            value={favoriteArtists}
            onChange={(e) => setFavoriteArtists(e.target.value)}
            placeholder="e.g., Disclosure, Disclosure, Disclosure"
          />
        </div>

        <div>
          <Label htmlFor="device" className="text-base font-semibold mb-2 block">
            Primary Device
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "mobile", label: "Mobile", icon: Radio },
              { value: "desktop", label: "Desktop", icon: Headphones },
              { value: "tablet", label: "Tablet", icon: Music },
            ].map(({ value, label, icon: Icon }) => (
              <div
                key={value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  deviceType === value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-accent"
                }`}
                onClick={() => setDeviceType(value)}
              >
                <Icon className="w-6 h-6 mx-auto mb-2" />
                <div className="text-center text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full" size="lg">
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}
