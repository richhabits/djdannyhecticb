import { Award, Music, Users, Radio } from "lucide-react";
import { Link } from "wouter";
import { BackButton } from "@/components/BackButton";

export default function About() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-16">

        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <section className="relative border-b-4 border-white pb-8">
          <div className="tape-strip bg-accent text-white border-white mb-6 inline-block">30_YEARS_DEEP</div>
          <h1 className="text-8xl md:text-[12rem] font-black uppercase tracking-tighter leading-[0.75] italic">
            THE<br />ARTIST
          </h1>
        </section>

        {/* Bio Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div className="aspect-square bg-white/5 border-2 border-white flex items-center justify-center">
              <img
                src="/dj-danny-bio.jpg"
                alt="DJ Danny Hectic B"
                className="w-full h-full object-cover grayscale"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Bio Text */}
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-lg leading-relaxed">
                DJ Danny Hectic B is a dynamic force in UK underground music. 30 years spanning UK Garage, House, Jungle, Grime, and contemporary electronic music.
              </p>
              <p className="text-lg leading-relaxed">
                Known for electrifying performances and seamless technical mixing. Every set is tailored to the room—reading crowds, building energy, delivering unforgettable moments.
              </p>
              <p className="text-lg leading-relaxed">
                Clean DBS approved. Valid USA Visa. Available for club gigs, private events, corporate functions, brand partnerships, and radio appearances across UK and internationally.
              </p>
            </div>

            <div className="flex gap-3 pt-6">
              <Link href="/bookings">
                <button className="tape-strip bg-white text-black border-black px-8 py-3 text-lg hover:bg-accent hover:text-white transition-all duration-150">
                  BOOK_NOW
                </button>
              </Link>
              <Link href="/live-studio">
                <button className="tape-strip bg-black text-white border-white px-8 py-3 text-lg hover:bg-accent hover:text-black transition-all duration-150">
                  WATCH_LIVE
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="border-t-4 border-white pt-16">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-12">EXPERTISE & SERVICES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-white p-6">
              <div className="tape-strip bg-accent text-white border-white mb-4 text-xs inline-block">CLUB & NIGHTLIFE</div>
              <p className="text-white/80 mb-3">High-energy performances at clubs, bars, lounges. Reading crowds, building dancefloor momentum, delivering packed nights.</p>
              <p className="text-xs font-mono text-accent uppercase">Venues: Fabric, Ministry, Electric Ballroom, SWG3, Warehouse Project +</p>
            </div>

            <div className="border-2 border-white p-6">
              <div className="tape-strip bg-white text-black border-black mb-4 text-xs inline-block">WEDDINGS & EVENTS</div>
              <p className="text-white/80 mb-3">Creating perfect atmospheres for special days. Ceremony to reception, every moment locked in and memorable.</p>
              <p className="text-xs font-mono text-accent uppercase">Services: Consultations, Custom setlists, Equipment included</p>
            </div>

            <div className="border-2 border-white p-6">
              <div className="tape-strip bg-accent text-white border-white mb-4 text-xs inline-block">CORPORATE & BRAND</div>
              <p className="text-white/80 mb-3">Professional services for product launches, conferences, brand activations, company celebrations. Adaptable to any environment.</p>
              <p className="text-xs font-mono text-accent uppercase">Rates: Starting £2000+ | Enquire for custom packages</p>
            </div>

            <div className="border-2 border-white p-6">
              <div className="tape-strip bg-white text-black border-black mb-4 text-xs inline-block">PRIVATE PARTIES</div>
              <p className="text-white/80 mb-3">Birthdays, anniversaries, graduations, intimate gatherings. Personalized music selection matching your vision exactly.</p>
              <p className="text-xs font-mono text-accent uppercase">Rates: Starting £500+ | Flexible for smaller budgets</p>
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="border-t-4 border-white pt-16">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-12">WHY_DANNY?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border-2 border-white p-6 text-center">
              <Award className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="font-black uppercase text-sm mb-2">CERTIFIED</p>
              <p className="text-xs text-white/60">Clean DBS | Valid USA Visa | Insurance approved</p>
            </div>

            <div className="border-2 border-white p-6 text-center">
              <Music className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="font-black uppercase text-sm mb-2">DIVERSE</p>
              <p className="text-xs text-white/60">UK Garage → Grime → Jungle → House → Contemporary</p>
            </div>

            <div className="border-2 border-white p-6 text-center">
              <Users className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="font-black uppercase text-sm mb-2">CROWD READER</p>
              <p className="text-xs text-white/60">Keeps energy high, adapts on the fly, reads the room</p>
            </div>

            <div className="border-2 border-white p-6 text-center">
              <Radio className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="font-black uppercase text-sm mb-2">PROFESSIONAL</p>
              <p className="text-xs text-white/60">Top equipment | Reliable | Experienced | Dedicated</p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-t-4 border-white pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border-2 border-white p-6 text-center">
              <p className="text-4xl font-black text-accent mb-2">30+</p>
              <p className="text-xs uppercase font-black tracking-widest">YEARS IN MUSIC</p>
            </div>
            <div className="border-2 border-white p-6 text-center">
              <p className="text-4xl font-black text-accent mb-2">500+</p>
              <p className="text-xs uppercase font-black tracking-widest">GIGS PERFORMED</p>
            </div>
            <div className="border-2 border-white p-6 text-center">
              <p className="text-4xl font-black text-accent mb-2">100K+</p>
              <p className="text-xs uppercase font-black tracking-widest">LISTENERS REACHED</p>
            </div>
            <div className="border-2 border-white p-6 text-center">
              <p className="text-4xl font-black text-accent mb-2">∞</p>
              <p className="text-xs uppercase font-black tracking-widest">PASSION FOR MUSIC</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t-4 border-white pt-16 text-center">
          <h2 className="text-5xl font-black uppercase tracking-tighter mb-8">READY TO LOCK IN?</h2>
          <Link href="/bookings">
            <button className="tape-strip bg-white text-black border-black px-16 py-6 text-3xl hover:bg-accent hover:text-white transition-all duration-150">
              BOOK_DANNY
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}
