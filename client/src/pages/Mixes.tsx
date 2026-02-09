import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Music, Play, Disc, Filter, Heart, SlidersHorizontal, Zap } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import AudioPlayer from "@/components/AudioPlayer";
import ReactPlayer from "react-player";
import { MetaTagsComponent } from "@/components/MetaTags";
import { MusicStructuredData } from "@/components/StructuredData";
import { motion } from "framer-motion";

export default function Mixes() {
  const { isAuthenticated, user } = useAuth();
  const [playing, setPlaying] = useState<number | null>(null);
  const [selectedMixes, setSelectedMixes] = useState<any[]>([]);
  const [playingExternal, setPlayingExternal] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>("All");

  const { data: mixes, isLoading } = trpc.mixes.free.useQuery();

  const sampleTracks = [
    {
      id: "1",
      title: "UK Garage Classics Mix",
      artist: "DJ Danny Hectic B",
      genre: "UK Garage",
      coverArt: "/logo-danny-hectic-b.png",
      energy: "HIGH"
    },
    {
      id: "2",
      title: "Soulful House Journey",
      artist: "DJ Danny Hectic B",
      genre: "Soulful House",
      coverArt: "/logo-danny-hectic-b.png",
      energy: "SMOOTH"
    }
  ];

  const handlePlayMix = (mix: any) => {
    if (mix.soundcloudUrl || mix.youtubeUrl) {
      setPlayingExternal(String(mix.id));
      setSelectedMixes([]);
    } else {
      setPlayingExternal(null);
      setSelectedMixes([{
        id: String(mix.id),
        title: mix.title,
        artist: mix.artist || "DJ Danny Hectic B",
        url: mix.audioUrl,
        coverArt: mix.coverImageUrl,
      }]);
    }
  };

  return (
    <>
      <MetaTagsComponent
        title="THE VAULT | DJ MIX ARCHIVE"
        description="Access the full frequency history of DJ Danny Hectic B. Free downloads and streaming."
        url="/mixes"
      />

      <div className="min-h-screen bg-black text-white selection:bg-accent pirate-scanlines pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">

          {/* BRUTAL HEADER */}
          <section className="relative border-b-4 border-white pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
              <div className="space-y-6">
                <div className="tape-strip bg-accent text-white border-white">ESTABLISHED 1994</div>
                <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.75] italic">
                  THE<br />VAULT
                </h1>
              </div>
              <div className="max-w-md space-y-4">
                <div className="tape-strip bg-white text-black border-black text-xs">AUDIO_ARCHIVE_RETRIEVAL</div>
                <p className="text-white/60 font-medium uppercase leading-tight">
                  DECADES OF SONIC INTELLIGENCE. DOWNLOADABLE FREQUENCIES. RAW SOUNDBOARDS FROM THE UNDERGROUND DEPTHS.
                </p>
              </div>
            </div>
          </section>

          {/* PLAYER BAR (Sticky-ish) */}
          {selectedMixes.length > 0 && (
            <div className="sticky top-20 z-40">
              <div className="flyer-card p-4 border-accent shadow-[4px_4px_0px_#F97316]">
                <AudioPlayer tracks={selectedMixes} autoPlay />
              </div>
            </div>
          )}

          {/* FILTERS */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {["All", "UK Garage", "House", "Grime", "DnB", "Amapiano"].map(g => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`tape-strip text-xs whitespace-nowrap px-8 py-2 ${filterGenre === g ? 'bg-accent border-white' : 'bg-black border-white hover:bg-white hover:text-black'}`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {(mixes || sampleTracks).map((mix: any, idx) => (
              <motion.div
                key={mix.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flyer-card p-6 flex flex-col group"
              >
                <div className="aspect-square bg-neutral-900 mb-6 border-2 border-white relative overflow-hidden">
                  {mix.coverImageUrl || mix.coverArt ? (
                    <img src={mix.coverImageUrl || mix.coverArt} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Disc className="w-24 h-24 text-white/5 group-hover:text-white/20 transition-all" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <button
                      onClick={() => handlePlayMix(mix)}
                      className="tape-strip bg-white text-black border-black px-8 py-2 text-lg"
                    >
                      PLAY_SIGNAL
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <div className="tape-strip bg-accent text-white border-white text-[10px]">{mix.genre || "GENERAL"}</div>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-black italic uppercase leading-none">{mix.title}</h3>
                  <p className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">{mix.artist || "DJ DANNY HECTIC B"}</p>
                </div>

                <div className="mt-8 flex gap-2">
                  <button className="flex-1 tape-strip bg-black text-white border-white text-[10px] hover:bg-accent transition-all">
                    DOWNLOAD
                  </button>
                  <button className="p-3 border-2 border-white flex items-center justify-center hover:bg-white hover:text-black transition-all">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FOOTER CALL */}
          <section className="py-24 border-t-4 border-white flex flex-col items-center gap-8">
            <h2 className="text-4xl font-black italic uppercase text-center">Missing a specific transmission?</h2>
            <Link href="/contact">
              <button className="tape-strip bg-white text-black border-black px-12 py-4 text-2xl hover:bg-accent hover:text-white transition-all">
                CONTACT_DISPATCH
              </button>
            </Link>
          </section>

        </div>
      </div>
    </>
  );
}
