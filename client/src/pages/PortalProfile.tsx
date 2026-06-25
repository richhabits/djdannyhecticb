import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { PortalNav } from "@/components/PortalNav";
import { PortalGuard } from "@/components/PortalGuard";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadPortalAvatar } from "@/lib/portalUpload";

function ProfileContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: profile } = trpc.portal.profile.get.useQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [form, setForm] = useState({
    displayName: "",
    company: "",
    phone: "",
    bio: "",
    avatarUrl: "",
    artistGenre: "",
    brandIndustry: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      displayName: profile.displayName ?? "",
      company: profile.company ?? "",
      phone: profile.phone ?? "",
      bio: profile.bio ?? "",
      avatarUrl: profile.avatarUrl ?? "",
      artistGenre: profile.artistGenre ?? "",
      brandIndustry: profile.brandIndustry ?? "",
    });
  }, [profile]);

  const upsert = trpc.portal.profile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile saved");
      utils.portal.profile.get.invalidate();
    },
    onError: (error) => toast.error(error.message || "Failed to save profile"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsert.mutate({
      displayName: form.displayName || undefined,
      company: form.company || undefined,
      phone: form.phone || undefined,
      bio: form.bio || undefined,
      avatarUrl: form.avatarUrl || undefined,
      artistGenre: form.artistGenre || undefined,
      brandIndustry: form.brandIndustry || undefined,
    });
  };

  const handleAvatarSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadPortalAvatar(file);
      setForm((f) => ({ ...f, avatarUrl: url }));
      toast.success("Avatar uploaded — don't forget to save");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-6xl mx-auto">
      <PortalNav />

      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <Card className="p-6 glass max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="w-20 h-20">
              <AvatarImage src={form.avatarUrl} alt={form.displayName} />
              <AvatarFallback>{(form.displayName || user?.email || "?").slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarSelect(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" disabled={uploadingAvatar} onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {uploadingAvatar ? "Uploading..." : "Change Avatar"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
            </div>
          </div>

          {(user?.role === "brand" || user?.role === "booking_client") && (
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1" />
            </div>
          )}

          {user?.role === "artist" && (
            <div>
              <Label htmlFor="artistGenre">Genre</Label>
              <Input id="artistGenre" value={form.artistGenre} onChange={(e) => setForm({ ...form, artistGenre: e.target.value })} className="mt-1" placeholder="House, Afrobeats, Hip-Hop..." />
            </div>
          )}

          {user?.role === "brand" && (
            <div>
              <Label htmlFor="brandIndustry">Industry</Label>
              <Input id="brandIndustry" value={form.brandIndustry} onChange={(e) => setForm({ ...form, brandIndustry: e.target.value })} className="mt-1" />
            </div>
          )}

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1" rows={4} />
          </div>

          <Button type="submit" disabled={upsert.isPending} className="bg-gradient-to-r from-orange-600 to-amber-600">
            {upsert.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function PortalProfile() {
  return (
    <PortalGuard>
      <ProfileContent />
    </PortalGuard>
  );
}
