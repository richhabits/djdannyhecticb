import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { BackButton } from "@/components/BackButton";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("TRANSMISSION RECEIVED. DANNY WILL RESPOND WITHIN 24 HOURS. 📡");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto flex flex-col gap-16">

        {/* Back Button */}
        <BackButton />

        {/* Header */}
        <section className="relative border-b-4 border-white pb-8">
          <div className="tape-strip bg-accent text-white border-white mb-6 inline-block">DISPATCH_CONTACT_FORM</div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.75] italic">
            REACH_OUT
          </h1>
        </section>

        {/* Contact Form */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="tape-strip bg-white text-black border-black mb-6 text-xs inline-block">DIRECT_MESSAGE</div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-black mb-2 tracking-widest">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2 tracking-widest">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2 tracking-widest">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent"
                  placeholder="+44 (0) 000 000 0000"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2 tracking-widest">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent"
                  placeholder="Booking / Question / Other"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-black mb-2 tracking-widest">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-white bg-black text-white placeholder-white/40 font-mono focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-accent resize-none"
                  placeholder="Enter your message..."
                  rows={5}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="tape-strip bg-white text-black border-black w-full py-4 text-lg hover:bg-accent hover:text-white transition-all duration-150 disabled:opacity-50"
              >
                {isSubmitting ? "TRANSMITTING..." : (
                  <>
                    <Send className="w-4 h-4 inline mr-2" />
                    SEND_TRANSMISSION
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <div className="tape-strip bg-accent text-white border-white mb-6 text-xs inline-block">CONTACT_CHANNELS</div>

              <div className="space-y-6">
                <div className="border-l-4 border-accent pl-4">
                  <p className="text-xs uppercase font-black tracking-widest text-accent mb-1">EMAIL</p>
                  <p className="font-mono">contact@djdannyhectic.com</p>
                </div>

                <div className="border-l-4 border-white pl-4">
                  <p className="text-xs uppercase font-black tracking-widest mb-1">PHONE</p>
                  <p className="font-mono">+44 (0) 000 000 0000</p>
                </div>

                <div className="border-l-4 border-accent pl-4">
                  <p className="text-xs uppercase font-black tracking-widest text-accent mb-1">LOCATION</p>
                  <p className="font-mono">London, United Kingdom</p>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="border-2 border-white p-6 bg-black">
              <p className="tape-strip bg-accent text-white border-white mb-4 text-xs inline-block">RESPONSE_TIMES</p>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span>MON - FRI:</span>
                  <span className="text-accent">9 AM - 9 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>SATURDAY:</span>
                  <span className="text-accent">10 AM - 11 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>SUNDAY:</span>
                  <span className="text-accent">12 PM - 8 PM</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-4 font-mono">Typically respond within 24 hours. Urgent matters prioritized.</p>
            </div>

            {/* Social */}
            <div className="border-2 border-white p-6 bg-black">
              <p className="tape-strip bg-white text-black border-black mb-4 text-xs inline-block">FOLLOW_ON_SOCIALS</p>
              <div className="flex gap-2 flex-wrap">
                {['Instagram', 'TikTok', 'X', 'Spotify'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="tape-strip bg-black text-white border-white text-xs hover:bg-accent transition-all duration-150"
                  >
                    {social.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t-4 border-white pt-16">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">COMMON_QUESTIONS</h2>
          <div className="space-y-3">
            {[
              { q: "How long before you respond?", a: "Usually within 24 hours. Urgent inquiries flagged and prioritized." },
              { q: "Can I book directly through this form?", a: "Yes. Include event details (date, venue, type, budget) and we'll confirm availability." },
              { q: "What's the fastest way to reach you?", a: "Email for written inquiries, phone for urgent matters. Both checked regularly." },
              { q: "Do you offer DJ lessons?", a: "Yes. Contact us with your skill level and goals — we can discuss packages." },
            ].map((item, idx) => (
              <details key={idx} className="group border-2 border-white">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-bold uppercase text-sm hover:bg-accent hover:text-black transition-all duration-150">
                  <span>{item.q}</span>
                  <span className="transition group-open:rotate-180 text-accent group-open:text-black">▼</span>
                </summary>
                <div className="px-4 pb-4 text-white/80 border-t-2 border-white font-mono text-sm">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t-4 border-white pt-16 text-center">
          <p className="text-white/60 uppercase font-black tracking-widest mb-6">OR VISIT:</p>
          <Link href="/bookings">
            <button className="tape-strip bg-white text-black border-black px-12 py-4 text-2xl hover:bg-accent hover:text-white transition-all duration-150">
              BOOKINGS_PAGE
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}
