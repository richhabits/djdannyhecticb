import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Disc, Mic2, Star } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";

import { MetaTagsComponent } from "@/components/MetaTags";

export default function Bio() {
    return (
        <>
            <MetaTagsComponent
                title="BIO | 30 YEARS DEEP"
                description="The story of DJ Danny Hectic B. From the underground to the empire."
                url="/bio"
            />
            <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
                {/* Hero Section */}
                <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden flex items-end">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/danny-main.jpg"
                            alt="DJ Danny Hectic B"
                            className="w-full h-full object-cover object-top filter contrast-125 brightness-75"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
                    </div>

                    <div className="container relative z-10 pb-20 md:pb-32 px-6">
                        <div className="max-w-4xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600 text-white text-xs font-bold uppercase tracking-widest sharp-edge mb-6">
                                <Star className="w-3 h-3 fill-current" />
                                The Legend
                            </div>
                            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter magazine-heading drop-shadow-2xl mb-8">
                                DANNY<br />HECTIC B
                            </h1>
                            <p className="text-xl md:text-3xl text-gray-300 font-medium tracking-wide border-l-4 border-orange-500 pl-6 max-w-2xl">
                                From the underground to the empire. 30 years of pure UK Garage & House history.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Bio Content */}
                <section className="py-20 bg-background border-t border-white/5">
                    <div className="container px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-bold magazine-heading mb-8">The Story</h2>
                                <div className="prose prose-invert prose-lg text-gray-400 space-y-6 leading-relaxed font-light">
                                    <p>
                                        <span className="text-white font-bold text-xl">It started with a beat.</span> From the smoky underground raves of the 90s to the digital airwaves of today, DJ Danny Hectic B has been a cornerstone of the UK Garage and House scene for over three decades.
                                    </p>
                                    <p>
                                        Known for his technical precision and an encyclopedic knowledge of the groove, Danny brings the authentic London sound to every set. He doesn't just play tracks; he curates an atmosphere. Whether it's the soulful rhythms of deep House or the gritty, skipping basslines of Garage and Grime, his sets are a journey through the evolution of British dance music.
                                    </p>
                                    <p>
                                        Now, with the <strong>Hectic Empire</strong>, he's taking it global. Creating a hub for the culture, the music, and the community. This isn't just DJing—it's legacy.
                                    </p>
                                </div>

                                <div className="pt-8">
                                    <h3 className="text-sm font-bold tracking-[0.2em] text-orange-500 uppercase mb-4">Connect</h3>
                                    <SocialLinks variant="magazine" />
                                </div>
                            </div>

                            {/* Visuals / Logos */}
                            <div className="grid grid-cols-1 gap-8">
                                <div className="relative group overflow-hidden sharp-edge aspect-[4/3] bg-black border border-white/10">
                                    <img src="/logo-old-decks.jpg" alt="Legacy - Decks" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                                        <p className="text-white font-bold tracking-widest uppercase text-sm">The Craft</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="relative aspect-square bg-white/5 sharp-edge flex items-center justify-center p-8 border border-white/10 group hover:border-orange-500/50 transition-colors">
                                        <img src="/logo-headphones.png" alt="Headphones Logo" className="w-full h-full object-contain filter drop-shadow-lg group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="relative aspect-square bg-black sharp-edge flex items-center justify-center p-8 border border-white/10 group hover:border-orange-500/50 transition-colors bg-[url('/logo-decks.jpg')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                                        <Disc className="w-16 h-16 text-white relative z-10 opacity-80" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Experience / Stats */}
                <section className="py-20 bg-accent/5 border-y border-white/5">
                    <div className="container px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { label: "Years Active", value: "30+" },
                                { label: "Mixes Dropped", value: "500+" },
                                { label: "Events Rocked", value: "1000+" },
                                { label: "Vibes Level", value: "100%" },
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <p className="text-4xl md:text-6xl font-black text-white tracking-tighter">{stat.value}</p>
                                    <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 bg-black relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/danny-main.jpg')] bg-cover bg-fixed opacity-20 blur-sm" />
                    <div className="container relative z-10 px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 magazine-heading">Bring The Hectic Energy</h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Available for club nights, private events, and festivals. Guaranteed to shut it down.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/book-danny">
                                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white sharp-edge text-lg px-10 py-8 h-auto font-bold tracking-tight">
                                    BOOK DANNY NOW
                                </Button>
                            </Link>
                            <Link href="/mixes">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black sharp-edge text-lg px-10 py-8 h-auto font-bold tracking-tight">
                                    LISTEN TO MIXES
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
