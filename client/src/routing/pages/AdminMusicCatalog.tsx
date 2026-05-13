import { useState } from "react";
import { Loader2, Download, Music, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminMusicCatalog() {
  const { isAuthenticated, user } = useAuth();
  const [beatportUrl, setBeatportUrl] = useState("");

  const { data: soundcloudTracks, isLoading: scLoading } = trpc.soundcloud.tracks.useQuery();
  const { data: spotifyReleases, isLoading: spotifyLoading } = trpc.spotify.releases.useQuery();
  const { data: products } = trpc.products.list.useQuery({ activeOnly: false });

  const syncSoundCloud = trpc.soundcloud.sync.useMutation({
    onSuccess: (data) => {
      toast.success(`Synced ${data.created} new tracks, updated ${data.updated}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sync SoundCloud");
    },
  });

  const importSpotifyRelease = trpc.spotify.importRelease.useMutation({
    onSuccess: () => {
      toast.success("Release imported successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import release");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-white/60">You need to be logged in to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-0 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-6xl font-black uppercase mb-12">Music Catalog Manager</h1>

        {/* SoundCloud Sync */}
        <section className="mb-12 border-2 border-white/20 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6" />
            <h2 className="text-3xl font-bold uppercase">SoundCloud Sync</h2>
          </div>
          {scLoading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading SoundCloud tracks...</span>
            </div>
          ) : (
            <>
              <p className="text-white/60 mb-4">{soundcloudTracks?.length || 0} tracks found</p>
              <Button
                onClick={() => syncSoundCloud.mutate()}
                disabled={syncSoundCloud.isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase px-6 py-3"
              >
                {syncSoundCloud.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Sync Tracks to Products
                  </>
                )}
              </Button>
            </>
          )}
        </section>

        {/* Spotify Releases */}
        <section className="mb-12 border-2 border-white/20 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6" />
            <h2 className="text-3xl font-bold uppercase">Spotify Releases</h2>
          </div>
          {spotifyLoading ? (
            <div className="flex items-center gap-2 text-white/60">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading Spotify releases...</span>
            </div>
          ) : spotifyReleases && spotifyReleases.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {spotifyReleases.map((release) => (
                <div key={release.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded">
                  <div className="flex-1">
                    <h3 className="font-bold">{release.name}</h3>
                    <p className="text-sm text-white/60">{release.releaseDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={release.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                    <Button
                      onClick={() =>
                        importSpotifyRelease.mutate({
                          spotifyId: release.id,
                          name: release.name,
                          imageUrl: release.imageUrl,
                          spotifyUrl: release.spotifyUrl,
                        })
                      }
                      disabled={importSpotifyRelease.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase px-3 py-2 text-sm"
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/60">No releases found</p>
          )}
        </section>

        {/* Beatport Profile */}
        <section className="mb-12 border-2 border-white/20 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6" />
            <h2 className="text-3xl font-bold uppercase">Beatport Profile</h2>
          </div>
          <div className="space-y-3">
            <input
              type="url"
              value={beatportUrl}
              onChange={(e) => setBeatportUrl(e.target.value)}
              placeholder="https://www.beatport.com/artist/..."
              className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
            />
            <p className="text-sm text-white/60">Enter your Beatport artist profile URL to make it available for products</p>
          </div>
        </section>

        {/* Product Music Links */}
        <section className="border-2 border-white/20 p-8">
          <h2 className="text-3xl font-bold uppercase mb-6">Product Music Links</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 font-bold">Product</th>
                  <th className="text-left py-3 px-4 font-bold">Type</th>
                  <th className="text-left py-3 px-4 font-bold">SoundCloud</th>
                  <th className="text-left py-3 px-4 font-bold">Spotify</th>
                  <th className="text-left py-3 px-4 font-bold">Beatport</th>
                </tr>
              </thead>
              <tbody>
                {products
                  ?.filter((p) => p.soundcloudUrl || p.spotifyUrl || p.beatportUrl)
                  .slice(0, 20)
                  .map((product) => (
                    <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4 text-sm text-white/60">{product.type}</td>
                      <td className="py-3 px-4">
                        {product.soundcloudUrl && (
                          <a
                            href={product.soundcloudUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-400 hover:text-orange-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {product.spotifyUrl && (
                          <a
                            href={product.spotifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {product.beatportUrl && (
                          <a
                            href={product.beatportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!products?.some((p) => p.soundcloudUrl || p.spotifyUrl || p.beatportUrl) && (
              <div className="text-center py-8 text-white/60">No products with music links yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
