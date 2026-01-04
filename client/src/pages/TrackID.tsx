import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Music, Upload, Clock, CheckCircle } from "lucide-react";
import { MetaTagsComponent } from "@/components/MetaTags";
import { useAuth } from "@/_core/hooks/useAuth";

export default function TrackID() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    trackDescription: "",
    audioUrl: "",
    timestamp: "",
    source: "",
  });

  const createRequest = trpc.trackIdRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Track ID request submitted! We'll get back to you soon.");
      setFormData({ trackDescription: "", audioUrl: "", timestamp: "", source: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trackDescription.trim()) {
      toast.error("Please describe the track");
      return;
    }
    createRequest.mutate({
      userId: user?.id,
      userName: user?.name,
      email: user?.email,
      ...formData,
    });
  };

  return (
    <>
      <MetaTagsComponent
        title="Track ID Request | DJ Danny Hectic B"
        description="Request help identifying a track from DJ Danny Hectic B's mixes or shows."
        url="/track-id"
      />
      <div className="min-h-screen bg-background text-foreground pt-14">
        {/* Hero Section */}
        <section className="border-b border-foreground px-4 py-12 md:py-20">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black uppercase mb-6 tracking-tighter">
              Track ID Request
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Heard a track you love? Request help identifying it from Danny's mixes, shows, or live sets.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 md:py-20 px-4">
          <div className="container max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  Request Track Identification
                </CardTitle>
                <CardDescription>
                  Provide as much detail as possible to help us identify the track.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="trackDescription">Track Description *</Label>
                    <Textarea
                      id="trackDescription"
                      value={formData.trackDescription}
                      onChange={(e) => setFormData({ ...formData, trackDescription: e.target.value })}
                      placeholder="Describe the track: genre, tempo, lyrics, vocals, instruments, etc."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="source">Where did you hear it? *</Label>
                    <Select
                      value={formData.source}
                      onValueChange={(value) => setFormData({ ...formData, source: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mix">Mix / Set</SelectItem>
                        <SelectItem value="live">Live Show</SelectItem>
                        <SelectItem value="radio">Radio Show</SelectItem>
                        <SelectItem value="podcast">Podcast</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timestamp">Timestamp (if applicable)</Label>
                    <Input
                      id="timestamp"
                      value={formData.timestamp}
                      onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                      placeholder="e.g., 1:23:45 or 45:30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audioUrl">Audio Clip URL (optional)</Label>
                    <Input
                      id="audioUrl"
                      type="url"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="Link to audio clip (SoundCloud, YouTube, etc.)"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createRequest.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {createRequest.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="mt-8 space-y-4">
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Better Identification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <p>Include any lyrics you remember, even if partial</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <p>Describe the genre, tempo, and mood</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <p>Mention any distinctive sounds or instruments</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <p>Provide the exact timestamp if possible</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

