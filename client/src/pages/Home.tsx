import { useAuth } from "@/_core/hooks/useAuth";
import { Play, Calendar, ArrowRight, Radio, Zap, Shield, Waves, Disc } from "lucide-react";
import { Link } from "wouter";
import { MetaTagsComponent } from "@/components/MetaTags";
import { WebsiteStructuredData } from "@/components/StructuredData";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: upcomingEvents } = trpc.events.upcoming.useQuery();

  return (
    <>
      <MetaTagsComponent
        title="DJ DANNY HECTIC B | PIRATE RADIO ERA"
        description="DJ Danny Hectic B - 30 Years of UK Garage & House History. Raw underground energy from Watford to the World."
        url="/"
        type="website"
      />
      <WebsiteStructuredData
        name="DJ Danny Hectic B"
        description="Legendary UK Garage and House DJ. Pirate radio legacy, Watford's finest."
        url={typeof window !== "undefined" ? window.location.origin : "https://djdannyhecticb.co.uk"}
      />

      <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white pirate-scanlines">

        {/* HERO POSTER SECTION */}
        <section className="relative min-h-screen w-full flex flex-col justify-end px-6 pb-20 pt-32 overflow-hidden border-b-4 border-white">
          <div className="absolute top-10 left-6 z-20 space-y-2">
            <div className="tape-strip bg-accent text-white border-white text-xs">
              SIGNAL: STABLE / 99.9%
            </div>
            <div className="tape-strip bg-white text-black border-black text-[10px] block">
              LOC: WATFORD / LONDON / UK
            </div>
          </div>

          {/* Background Gritty Elements */}
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none origin-center scale-110">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50" />
            <div className="absolute inset-0 border-[40px] border-white/5" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="relative z-10"
          >
            <h1 className="text-[22vw] sm:text-[18vw] font-black uppercase tracking-tighter leading-[0.75] italic glitch-text">
              DANNY<br />HECTIC B
            </h1>

            <div className="mt-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <p className="text-xl md:text-2xl font-bold uppercase tracking-tight bg-white text-black px-4 py-2 inline-block">
                  AMAPIANO • UKG • GRIME • DNB • SOULFUL HOUSE
                </p>
                <p className="text-lg text-white/60 font-medium leading-tight uppercase">
                  Architectural soundscapes for the high-frequency elite. <br />
                  30 years of UK underground legacy, refined for the modern era.
                </p>
              </div>

              <div className="flex gap-4">
                <Link href="/live-studio">
                  <button className="tape-strip bg-accent text-white border-white px-12 py-4 text-2xl hover:bg-white hover:text-black transition-all">
                    LISTEN LIVE
                  </button>
                </Link>
                <Link href="/bookings">
                  <button className="tape-strip bg-white text-black border-black px-12 py-4 text-2xl hover:bg-accent hover:text-white transition-all">
                    BOOK DANNY
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* MARQUEE TICKER */}
        <div className="bg-white text-black py-4 border-b-4 border-black font-black uppercase italic overflow-hidden whitespace-nowrap marquee-ticker">
          <div className="marquee-content text-2xl">
            LOCKED IN TO THE EMPIRE SIGNAL • NEXT SET: FRIDAY NIGHT STUDIO SESSION • NEW MIX DROP: SUMMER VIBES VOL. 4 • WATFORD'S FINEST SINCE 1994 • AMAPIANO • UKG • GRIME • DNB • SOULFUL HOUSE •
          </div>
        </div>

        {/* MIXES / FLYER GRID */}
        <section className="py-32 px-6 container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8 border-l-8 border-accent pl-8">
            <div className="space-y-4">
              <span className="tape-strip bg-black text-white border-white text-xs italic">Archive Retrieval</span>
              <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none italic">THE<br />VAULT</h2>
            </div>
            <Link href="/mixes">
              <button className="tape-strip bg-white text-black border-black px-10 py-4 text-xl hover:bg-accent hover:text-white">
                EXPLORE ALL
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              { title: "SUMMER VIBES VOL. 4", genre: "AMAPIANO", time: "62:14", energy: "HIGH" },
              { title: "UNDERGROUND DEPTHS", genre: "UKG", time: "45:00", energy: "ELITE" },
              { title: "PIRATE ERA REWIND", genre: "GRIME / DNB", time: "90:30", energy: "RAW" }
            ].map((mix, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flyer-card p-8 group cursor-pointer"
              >
                <div className="aspect-square bg-neutral-900 mb-8 border-2 border-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Disc className="w-24 h-24 text-white/10 group-hover:text-white/30 transition-all duration-500 animate-spin-slow" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="tape-strip bg-accent text-white border-white text-[10px]">{mix.genre}</span>
                  </div>
                </div>
                <h3 className="text-3xl font-black italic mb-4">{mix.title}</h3>
                <div className="flex justify-between border-t border-white/20 pt-4 text-xs font-bold uppercase tracking-widest opacity-60">
                  <span>RUN: {mix.time}</span>
                  <span>FREQ: {mix.energy}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* BOOKING BRUTALISM */}
        <section className="py-40 bg-accent text-white px-6 border-y-4 border-black">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <h2 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.75] italic text-black">
                BOOK<br />HECTIC
              </h2>
              <div className="space-y-6">
                <p className="text-3xl font-bold bg-white text-black px-6 py-4 inline-block uppercase italic">
                  WATFORD / LONDON / GLOBAL
                </p>
                <p className="text-xl font-medium leading-tight uppercase text-black max-w-lg">
                  Secure the frequency for your next event. Private parties, club slots, and corporate takeovers. 30 years of professional delivery.
                </p>
              </div>
            </div>

            <div className="bg-black border-4 border-white p-12 space-y-8 shadow-[20px_20px_0px_#fff]">
              <div className="tape-strip bg-white text-black border-black text-xl">INQUIRY_FORM</div>
              <form className="space-y-6">
                <input className="w-full bg-transparent border-2 border-white/30 p-4 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30" placeholder="EVENT_NAME" />
                <input className="w-full bg-transparent border-2 border-white/30 p-4 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30" placeholder="EVENT_DATE" />
                <textarea className="w-full bg-transparent border-2 border-white/30 p-4 h-32 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30" placeholder="SPEC_DETAILS"></textarea>
                <button className="w-full tape-strip bg-accent text-white border-white py-6 text-2xl hover:bg-white hover:text-black transition-all">
                  SUBMIT_VOICE
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-20 px-6 border-b-8 border-white">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="tape-strip bg-white text-black border-black text-4xl italic">DJDHB</div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 italic">© 2024 PIRATE ERA IDENTITY SYSTEM</span>
            </div>

            <div className="flex gap-8 text-xs font-black uppercase tracking-[0.2em]">
              {['Instagram', 'SoundCloud', 'Apple Music', 'Spotify'].map(s => (
                <a key={s} href="#" className="tape-strip bg-black border-white hover:bg-accent transition-all">{s}</a>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
