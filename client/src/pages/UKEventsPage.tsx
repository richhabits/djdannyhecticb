/**
 * UK EVENTS DISCOVERY PAGE
 * Real-time automated UK events from Ticketmaster, festivals, boxing, music & more
 * Pirate Radio Era Design System
 */
import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { MetaTagsComponent } from '@/components/MetaTags';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    MapPin,
    Ticket,
    Music,
    Search,
    Filter,
    ChevronDown,
    ExternalLink,
    Clock,
    Users,
    Zap,
    Send,
    X,
    Plus,
    Star,
    Trophy,
    Mic2,
    Dumbbell,
    PartyPopper,
    Laugh,
    Theater
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'wouter';

// Category icons and colors
const CATEGORY_CONFIG = {
    music: { icon: Music, label: 'Music', color: 'bg-orange-500' },
    festival: { icon: PartyPopper, label: 'Festivals', color: 'bg-purple-500' },
    boxing: { icon: Dumbbell, label: 'Boxing & MMA', color: 'bg-red-500' },
    sports: { icon: Trophy, label: 'Sports', color: 'bg-green-500' },
    comedy: { icon: Laugh, label: 'Comedy', color: 'bg-yellow-500' },
    theatre: { icon: Theater, label: 'Theatre', color: 'bg-pink-500' },
    clubbing: { icon: Zap, label: 'Clubbing', color: 'bg-cyan-500' },
    other: { icon: Star, label: 'Other', color: 'bg-gray-500' },
};

// Event Card Component
function EventCard({ event, index }: { event: any; index: number }) {
    const category = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
    const CategoryIcon = category.icon;

    const formatPrice = () => {
        if (!event.priceMin && !event.priceMax) return 'TBC';
        if (event.priceMin === event.priceMax) return `£${event.priceMin}`;
        return `£${event.priceMin} - £${event.priceMax}`;
    };

    const getTicketStatusBadge = () => {
        switch (event.ticketStatus) {
            case 'sold_out': return { label: 'SOLD OUT', color: 'bg-red-600' };
            case 'limited': return { label: 'LIMITED', color: 'bg-yellow-600' };
            case 'cancelled': return { label: 'CANCELLED', color: 'bg-gray-600' };
            case 'postponed': return { label: 'POSTPONED', color: 'bg-orange-600' };
            default: return null;
        }
    };

    const ticketStatus = getTicketStatusBadge();
    const artists = event.artists ? JSON.parse(event.artists) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="flyer-card group cursor-pointer relative overflow-hidden"
        >
            {/* Featured Badge */}
            {event.isFeatured && (
                <div className="absolute top-0 right-0 z-20">
                    <div className="tape-strip bg-accent text-white border-white text-[10px] italic">
                        FEATURED
                    </div>
                </div>
            )}

            {/* Image Section */}
            <div className="aspect-[4/3] bg-neutral-900 relative overflow-hidden border-b-2 border-white">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                        <CategoryIcon className="w-16 h-16 text-white/10" />
                    </div>
                )}

                {/* Ticket Status Overlay */}
                {ticketStatus && (
                    <div className="absolute top-4 left-4">
                        <span className={`tape-strip ${ticketStatus.color} text-white border-white text-[10px]`}>
                            {ticketStatus.label}
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-4 left-4">
                    <span className={`tape-strip ${category.color} text-white border-white text-[10px]`}>
                        {category.label.toUpperCase()}
                    </span>
                </div>

                {/* Date Badge */}
                <div className="absolute bottom-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm border-2 border-white px-3 py-1 text-center">
                        <div className="text-2xl font-black text-accent leading-none">
                            {format(new Date(event.eventDate), 'd')}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wide">
                            {format(new Date(event.eventDate), 'MMM')}
                        </div>
                    </div>
                </div>

                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Content Section */}
            <div className="p-6 space-y-4">
                <h3 className="text-xl font-black uppercase italic line-clamp-2 group-hover:text-accent transition-colors">
                    {event.title}
                </h3>

                {/* Artists */}
                {artists.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mic2 className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{artists.slice(0, 3).join(', ')}{artists.length > 3 ? ` +${artists.length - 3}` : ''}</span>
                    </div>
                )}

                {/* Venue & City */}
                <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-accent" />
                    <span className="line-clamp-1">
                        {event.venueName && `${event.venueName}, `}{event.city}
                    </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 text-sm text-white/60">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>
                        {format(new Date(event.eventDate), 'EEE d MMM yyyy')}
                        {event.doorsTime && ` • Doors ${event.doorsTime}`}
                    </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-4">
                    <div className="text-lg font-black text-accent">
                        {formatPrice()}
                    </div>

                    {event.ticketUrl && event.ticketStatus !== 'sold_out' && event.ticketStatus !== 'cancelled' ? (
                        <a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tape-strip bg-accent text-white border-white px-4 py-2 text-sm hover:bg-white hover:text-black transition-all flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Ticket className="w-4 h-4" />
                            TICKETS
                        </a>
                    ) : (
                        <span className="text-xs font-bold uppercase tracking-wider opacity-40">
                            {event.ticketStatus === 'sold_out' ? 'SOLD OUT' :
                                event.ticketStatus === 'cancelled' ? 'CANCELLED' : 'INFO SOON'}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Featured Event Hero Card
function FeaturedEventHero({ event }: { event: any }) {
    const category = CATEGORY_CONFIG[event.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
    const CategoryIcon = category.icon;
    const artists = event.artists ? JSON.parse(event.artists) : [];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden border-4 border-white bg-black group cursor-pointer"
            style={{ boxShadow: '12px 12px 0px rgba(249, 115, 22, 0.3)' }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Side */}
                <div className="aspect-video lg:aspect-auto lg:h-full relative overflow-hidden">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-black">
                            <CategoryIcon className="w-32 h-32 text-white/10" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none lg:hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

                    {/* Category Badge */}
                    <div className="absolute top-6 left-6">
                        <span className={`tape-strip ${category.color} text-white border-white text-xs`}>
                            {category.label.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Content Side */}
                <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div>
                        <div className="tape-strip bg-accent text-white border-white text-xs inline-block mb-4">
                            SPOTLIGHT_EVENT
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black uppercase italic leading-none mb-4">
                            {event.title}
                        </h2>
                        {artists.length > 0 && (
                            <p className="text-lg text-white/80 font-bold uppercase">
                                ft. {artists.slice(0, 5).join(' • ')}
                            </p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-lg">
                            <Calendar className="w-5 h-5 text-accent" />
                            <span className="font-bold">
                                {format(new Date(event.eventDate), 'EEEE, MMMM d, yyyy')}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 text-lg">
                            <MapPin className="w-5 h-5 text-accent" />
                            <span>
                                {event.venueName}, {event.city}
                            </span>
                        </div>

                        {event.doorsTime && (
                            <div className="flex items-center gap-3 text-lg">
                                <Clock className="w-5 h-5 text-accent" />
                                <span>Doors: {event.doorsTime}</span>
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <p className="text-white/60 line-clamp-3">
                            {event.description}
                        </p>
                    )}

                    <div className="flex items-center gap-4 pt-4">
                        {event.ticketUrl && (
                            <a
                                href={event.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tape-strip bg-accent text-white border-white px-8 py-4 text-xl hover:bg-white hover:text-black transition-all flex items-center gap-3"
                            >
                                <Ticket className="w-5 h-5" />
                                GET TICKETS
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}

                        {event.priceMin && (
                            <div className="text-2xl font-black text-accent">
                                From £{event.priceMin}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Submit Event Modal
function SubmitEventModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [step, setStep] = useState<'choose' | 'user' | 'promoter'>('choose');
    const [formData, setFormData] = useState({
        submitterName: '',
        submitterEmail: '',
        submitterPhone: '',
        isPromoter: false,
        title: '',
        description: '',
        category: 'music' as const,
        genre: '',
        venueName: '',
        venueAddress: '',
        city: '',
        postcode: '',
        eventDate: '',
        doorsTime: '',
        imageUrl: '',
        ticketUrl: '',
        priceMin: '',
        priceMax: '',
        artists: '',
        ageRestriction: '',
        additionalNotes: '',
    });

    const submitMutation = trpc.ukEvents.submit.useMutation({
        onSuccess: () => {
            onClose();
            setStep('choose');
            setFormData({
                submitterName: '',
                submitterEmail: '',
                submitterPhone: '',
                isPromoter: false,
                title: '',
                description: '',
                category: 'music',
                genre: '',
                venueName: '',
                venueAddress: '',
                city: '',
                postcode: '',
                eventDate: '',
                doorsTime: '',
                imageUrl: '',
                ticketUrl: '',
                priceMin: '',
                priceMax: '',
                artists: '',
                ageRestriction: '',
                additionalNotes: '',
            });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-black border-4 border-white p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                style={{ boxShadow: '12px 12px 0px rgba(249, 115, 22, 0.3)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="tape-strip bg-accent text-white border-white text-lg">
                        SUBMIT_EVENT
                    </div>
                    <button onClick={onClose} className="text-white hover:text-accent">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {step === 'choose' && (
                    <div className="space-y-6">
                        <p className="text-lg text-white/80">
                            Got an event that should be on our radar? Submit it for review and we'll feature it on the platform.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => { setFormData(f => ({ ...f, isPromoter: false })); setStep('user'); }}
                                className="border-2 border-white p-6 hover:bg-accent hover:border-accent transition-all text-left group"
                            >
                                <Users className="w-8 h-8 mb-4 group-hover:text-black" />
                                <h3 className="text-xl font-black uppercase mb-2 group-hover:text-black">I'm a Fan</h3>
                                <p className="text-sm text-white/60 group-hover:text-black/60">
                                    Recommend an event you're excited about
                                </p>
                            </button>

                            <button
                                onClick={() => { setFormData(f => ({ ...f, isPromoter: true })); setStep('promoter'); }}
                                className="border-2 border-white p-6 hover:bg-white hover:border-white transition-all text-left group"
                            >
                                <Mic2 className="w-8 h-8 mb-4 group-hover:text-black" />
                                <h3 className="text-xl font-black uppercase mb-2 group-hover:text-black">I'm a Promoter</h3>
                                <p className="text-sm text-white/60 group-hover:text-black/60">
                                    Submit your event for promotion
                                </p>
                            </button>
                        </div>
                    </div>
                )}

                {(step === 'user' || step === 'promoter') && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Submitter Info */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.submitterName}
                                    onChange={(e) => setFormData(f => ({ ...f, submitterName: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="ENTER YOUR NAME"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.submitterEmail}
                                    onChange={(e) => setFormData(f => ({ ...f, submitterEmail: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="YOUR@EMAIL.COM"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.submitterPhone}
                                    onChange={(e) => setFormData(f => ({ ...f, submitterPhone: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="+44..."
                                />
                            </div>

                            {/* Event Details */}
                            <div className="md:col-span-2 pt-4 border-t border-white/20">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="EVENT NAME"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Category *</label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as any }))}
                                    className="w-full bg-black border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase"
                                >
                                    <option value="music">Music</option>
                                    <option value="festival">Festival</option>
                                    <option value="boxing">Boxing/MMA</option>
                                    <option value="sports">Sports</option>
                                    <option value="comedy">Comedy</option>
                                    <option value="theatre">Theatre</option>
                                    <option value="clubbing">Clubbing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Genre</label>
                                <input
                                    type="text"
                                    value={formData.genre}
                                    onChange={(e) => setFormData(f => ({ ...f, genre: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="E.G. UK GARAGE, HOUSE"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Description *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold placeholder:text-white/30"
                                    placeholder="Tell us about the event..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Venue Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.venueName}
                                    onChange={(e) => setFormData(f => ({ ...f, venueName: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="VENUE NAME"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">City *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData(f => ({ ...f, city: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                    placeholder="LONDON"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Event Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.eventDate}
                                    onChange={(e) => setFormData(f => ({ ...f, eventDate: e.target.value }))}
                                    className="w-full bg-black border-2 border-white/30 p-3 focus:border-accent outline-none font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Doors Time</label>
                                <input
                                    type="time"
                                    value={formData.doorsTime}
                                    onChange={(e) => setFormData(f => ({ ...f, doorsTime: e.target.value }))}
                                    className="w-full bg-black border-2 border-white/30 p-3 focus:border-accent outline-none font-bold"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Ticket URL</label>
                                <input
                                    type="url"
                                    value={formData.ticketUrl}
                                    onChange={(e) => setFormData(f => ({ ...f, ticketUrl: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold placeholder:text-white/30"
                                    placeholder="HTTPS://..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Price From (£)</label>
                                <input
                                    type="text"
                                    value={formData.priceMin}
                                    onChange={(e) => setFormData(f => ({ ...f, priceMin: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold placeholder:text-white/30"
                                    placeholder="15.00"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Price To (£)</label>
                                <input
                                    type="text"
                                    value={formData.priceMax}
                                    onChange={(e) => setFormData(f => ({ ...f, priceMax: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold placeholder:text-white/30"
                                    placeholder="50.00"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-white/60">Artists / Performers</label>
                                <input
                                    type="text"
                                    value={formData.artists}
                                    onChange={(e) => setFormData(f => ({ ...f, artists: e.target.value }))}
                                    className="w-full bg-transparent border-2 border-white/30 p-3 focus:border-accent outline-none font-bold placeholder:text-white/30"
                                    placeholder="ARTIST 1, ARTIST 2, ARTIST 3"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setStep('choose')}
                                className="tape-strip bg-transparent text-white border-white px-6 py-3 hover:bg-white hover:text-black transition-all"
                            >
                                BACK
                            </button>

                            <button
                                type="submit"
                                disabled={submitMutation.isPending}
                                className="tape-strip bg-accent text-white border-white px-8 py-3 hover:bg-white hover:text-black transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitMutation.isPending ? 'SUBMITTING...' : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        SUBMIT EVENT
                                    </>
                                )}
                            </button>
                        </div>

                        {submitMutation.isError && (
                            <p className="text-red-500 text-sm">
                                {submitMutation.error?.message || 'Failed to submit event'}
                            </p>
                        )}
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
}

// Main Events Page
export default function UKEventsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    // Fetch events
    const { data: events, isLoading } = trpc.ukEvents.list.useQuery({
        category: selectedCategory || undefined,
        city: selectedCity || undefined,
        limit: 50,
    });

    // Fetch featured events
    const { data: featuredEvents } = trpc.ukEvents.featured.useQuery({ limit: 3 });

    // Fetch cities and categories for filters
    const { data: cities } = trpc.ukEvents.cities.useQuery();
    const { data: categories } = trpc.ukEvents.categories.useQuery();

    // Search results
    const { data: searchResults } = trpc.ukEvents.search.useQuery(
        { query: searchQuery, category: selectedCategory || undefined, city: selectedCity || undefined },
        { enabled: searchQuery.length >= 2 }
    );

    const displayedEvents = searchQuery.length >= 2 ? searchResults : events;
    const spotlightEvent = featuredEvents?.[0];

    return (
        <>
            <MetaTagsComponent
                title="UK EVENTS | DJ DANNY HECTIC B"
                description="Discover UK music events, festivals, boxing, and more. Automatically updated from Ticketmaster, StubHub and more. Submit your own events!"
                url="/events"
            />

            <div className="min-h-screen bg-black text-white selection:bg-accent selection:text-white">

                {/* HERO SECTION */}
                <section className="relative py-20 px-6 border-b-4 border-white overflow-hidden">
                    {/* Background noise */}
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50" />
                    </div>

                    <div className="container mx-auto relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                            <div className="space-y-4">
                                <div className="tape-strip bg-accent text-white border-white text-xs inline-block">
                                    LIVE // AUTO_SYNCED // UK
                                </div>
                                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.8] italic">
                                    UK<br />EVENTS
                                </h1>
                                <p className="text-xl text-white/60 max-w-lg uppercase font-medium">
                                    Music • Festivals • Boxing • Sports • Comedy<br />
                                    Real-time data from Ticketmaster & more
                                </p>
                            </div>

                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="tape-strip bg-white text-black border-black px-8 py-4 text-xl hover:bg-accent hover:text-white hover:border-white transition-all flex items-center gap-3"
                            >
                                <Plus className="w-5 h-5" />
                                SUBMIT EVENT
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex flex-col md:flex-row gap-4 max-w-4xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="SEARCH EVENTS, ARTISTS, VENUES..."
                                    className="w-full bg-transparent border-2 border-white/30 pl-12 pr-4 py-4 focus:border-accent outline-none font-bold uppercase placeholder:text-white/30"
                                />
                            </div>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`tape-strip ${showFilters ? 'bg-accent text-white' : 'bg-transparent text-white'} border-white px-6 py-4 hover:bg-accent transition-all flex items-center gap-2`}
                            >
                                <Filter className="w-5 h-5" />
                                FILTERS
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Filters */}
                        <AnimatePresence>
                            {showFilters && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-6 flex flex-wrap gap-4">
                                        {/* Category Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">Category</label>
                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="bg-black border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase min-w-[200px]"
                                            >
                                                <option value="">All Categories</option>
                                                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* City Filter */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">City</label>
                                            <select
                                                value={selectedCity}
                                                onChange={(e) => setSelectedCity(e.target.value)}
                                                className="bg-black border-2 border-white/30 p-3 focus:border-accent outline-none font-bold uppercase min-w-[200px]"
                                            >
                                                <option value="">All Cities</option>
                                                {cities?.map((city) => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Clear Filters */}
                                        {(selectedCategory || selectedCity || searchQuery) && (
                                            <button
                                                onClick={() => {
                                                    setSelectedCategory('');
                                                    setSelectedCity('');
                                                    setSearchQuery('');
                                                }}
                                                className="self-end tape-strip bg-transparent text-white border-white px-4 py-3 hover:bg-red-600 hover:border-red-600 transition-all flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                CLEAR
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* CATEGORY PILLS */}
                <section className="bg-white/5 border-b border-white/10 py-4 px-6 overflow-x-auto">
                    <div className="container mx-auto">
                        <div className="flex gap-3 min-w-max">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`tape-strip ${!selectedCategory ? 'bg-accent text-white' : 'bg-transparent text-white'} border-white text-sm hover:bg-accent transition-all`}
                            >
                                ALL
                            </button>
                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                                const count = categories?.find(c => c.category === key)?.count || 0;
                                const Icon = config.icon;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedCategory(key)}
                                        className={`tape-strip ${selectedCategory === key ? config.color : 'bg-transparent'} text-white border-white text-sm hover:${config.color} transition-all flex items-center gap-2`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {config.label.toUpperCase()}
                                        {count > 0 && <span className="opacity-60">({count})</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* SPOTLIGHT EVENT */}
                {spotlightEvent && !searchQuery && !selectedCategory && !selectedCity && (
                    <section className="py-12 px-6">
                        <div className="container mx-auto">
                            <FeaturedEventHero event={spotlightEvent} />
                        </div>
                    </section>
                )}

                {/* EVENTS GRID */}
                <section className="py-16 px-6">
                    <div className="container mx-auto">
                        {/* Section Header */}
                        <div className="flex items-end justify-between mb-12 border-l-8 border-accent pl-8">
                            <div>
                                <span className="tape-strip bg-black text-white border-white text-xs italic mb-2 inline-block">
                                    {searchQuery ? 'SEARCH_RESULTS' : selectedCategory || selectedCity ? 'FILTERED_EVENTS' : 'UPCOMING'}
                                </span>
                                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                                    {searchQuery
                                        ? `"${searchQuery}"`
                                        : selectedCategory
                                            ? CATEGORY_CONFIG[selectedCategory as keyof typeof CATEGORY_CONFIG]?.label
                                            : 'ALL EVENTS'
                                    }
                                </h2>
                            </div>

                            {displayedEvents && displayedEvents.length > 0 && (
                                <div className="text-right">
                                    <span className="text-4xl font-black text-accent">{displayedEvents.length}</span>
                                    <span className="text-sm font-bold uppercase tracking-wider text-white/60 block">EVENTS</span>
                                </div>
                            )}
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flyer-card animate-pulse">
                                        <div className="aspect-[4/3] bg-white/10" />
                                        <div className="p-6 space-y-4">
                                            <div className="h-6 bg-white/10 w-3/4" />
                                            <div className="h-4 bg-white/10 w-1/2" />
                                            <div className="h-4 bg-white/10 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Events Grid */}
                        {!isLoading && displayedEvents && displayedEvents.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {displayedEvents.map((event, index) => (
                                    <EventCard key={event.id} event={event} index={index} />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && (!displayedEvents || displayedEvents.length === 0) && (
                            <div className="text-center py-20">
                                <Calendar className="w-20 h-20 mx-auto mb-6 text-white/20" />
                                <h3 className="text-3xl font-black uppercase italic mb-4">NO EVENTS FOUND</h3>
                                <p className="text-white/60 mb-8 max-w-md mx-auto">
                                    {searchQuery
                                        ? `No events matching "${searchQuery}". Try a different search term.`
                                        : 'No events match your filters. Try adjusting your criteria.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('');
                                        setSelectedCity('');
                                        setSearchQuery('');
                                    }}
                                    className="tape-strip bg-accent text-white border-white px-8 py-4 hover:bg-white hover:text-black transition-all"
                                >
                                    CLEAR FILTERS
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* SUBMIT CTA SECTION */}
                <section className="py-24 px-6 bg-accent border-y-4 border-black">
                    <div className="container mx-auto text-center">
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic text-black mb-6">
                            GOT AN EVENT?
                        </h2>
                        <p className="text-xl text-black/80 max-w-2xl mx-auto mb-8 uppercase font-medium">
                            Promoters and fans can submit events for review. Get featured on our platform and reach thousands of UK ravers.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => setShowSubmitModal(true)}
                                className="tape-strip bg-black text-white border-black px-12 py-5 text-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
                            >
                                <Plus className="w-6 h-6" />
                                SUBMIT YOUR EVENT
                            </button>
                            <Link href="/contact">
                                <button className="tape-strip bg-transparent text-black border-black px-12 py-5 text-2xl hover:bg-black hover:text-white transition-all">
                                    PROMOTER INQUIRY
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FOOTER MARQUEE */}
                <div className="bg-black text-white py-4 border-b-4 border-white font-black uppercase italic overflow-hidden whitespace-nowrap marquee-ticker">
                    <div className="marquee-content text-xl">
                        UK EVENTS • MUSIC • FESTIVALS • BOXING • SPORTS • COMEDY • THEATRE • CLUBBING • TICKETMASTER • STUBHUB • EVENTBRITE • AUTO-SYNCED • REAL-TIME DATA • SUBMIT YOUR EVENTS •
                    </div>
                </div>
            </div>

            {/* Submit Event Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <SubmitEventModal
                        isOpen={showSubmitModal}
                        onClose={() => setShowSubmitModal(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
