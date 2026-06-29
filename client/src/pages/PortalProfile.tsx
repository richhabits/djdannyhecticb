import { useState, useEffect, useRef } from "react";
import { PortalLayout } from "@/components/PortalLayout";
import { usePortalAuth } from "@/contexts/PortalAuthContext";
import { trpc } from "@/lib/trpc";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Camera, Save, RefreshCw } from "lucide-react";

export default function PortalProfile() {
  const { user } = usePortalAuth();
  const utils = trpc.useUtils();
  const profileQ = trpc.portal.getProfile.useQuery();
  const updateMut = trpc.portal.updateProfile.useMutation({
    onSuccess: () => {
      utils.portal.getProfile.invalidate();
      toast.success("Profile updated");
    },
    onError: e => toast.error(e.message),
  });

  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [genre, setGenre] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profile = profileQ.data;

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setCompany(profile.company || "");
      setPhone(profile.phone || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
      setWebsite(profile.website || "");
      setInstagram(profile.instagramHandle || "");
      setGenre(profile.genre || "");
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Avatar must be under 10MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/portal/upload-url",
        clientPayload: JSON.stringify({ uploadType: "photo" }),
      });
      setAvatarUrl(blob.url);
      toast.success("Avatar uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Avatar upload failed");
    } finally {
      setAvatarUploading(false);
    }
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMut.mutate({
      displayName: displayName || undefined,
      company: company || undefined,
      phone: phone || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined,
      website: website || undefined,
      instagramHandle: instagram || undefined,
      genre: genre || undefined,
    });
  }

  const showArtistFields = user?.role === "artist";
  const showCompanyField = user?.role === "brand" || user?.role === "booking_client";

  return (
    <PortalLayout title="My Profile">
      <div className="max-w-xl space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 border-2 border-white/20 overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/5 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white/20" />
              </div>
            )}
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-[#f97316] animate-spin" />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="border-2 border-white/20 text-white/60 text-xs font-bold uppercase tracking-widest px-3 py-2 hover:border-[#f97316] hover:text-[#f97316] transition-colors disabled:opacity-40"
            >
              {avatarUploading ? "Uploading..." : "Change Avatar"}
            </button>
            <p className="text-white/30 text-xs mt-1">Max 10MB, JPG / PNG / WebP</p>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                placeholder={user?.name || "Your name"}
              />
            </div>

            {showCompanyField && (
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Company</label>
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
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                placeholder="+44..."
              />
            </div>

            {showArtistFields && (
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                  placeholder="e.g. Afrobeats, House"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Website</label>
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Instagram</label>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none"
                placeholder="@handle"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full bg-black border-2 border-white/20 text-white px-3 py-2.5 text-sm focus:border-[#f97316] focus:outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Account info (read-only) */}
          <div className="border-2 border-white/5 p-4 space-y-2">
            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Account</div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Role</span>
              <span className="text-[#f97316] uppercase text-xs font-bold">{user?.role?.replace("_", " ")}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMut.isPending}
            className="bg-[#f97316] text-black font-black uppercase tracking-widest px-6 py-2.5 text-sm hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {updateMut.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {updateMut.isPending ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </PortalLayout>
  );
}
