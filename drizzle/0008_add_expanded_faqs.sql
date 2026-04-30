-- Add expanded FAQs for Stream C - Task 3.4
-- This migration adds 30+ FAQ entries across 5 categories
-- Categories: Booking & Events, Merchandise, Technical, Shipping, General

INSERT INTO faqs (category, question, answer, "order") VALUES
-- BOOKING & EVENTS (8)
('Booking & Events', 'How far in advance should I book?', 'We recommend booking at least **2-4 weeks in advance** to secure your preferred date and time. However, we can accommodate **last-minute bookings (within 48 hours)** subject to availability and a rush fee of 50%.', 1),
('Booking & Events', 'What''s included in the booking price?', 'All packages include:
- Professional DJ equipment and sound system
- Basic lighting integration
- Full setup and breakdown
- Travel within the standard distance
- Professional MC services (upon request)
- Setlist customization

Extended hours, additional travel, and special requests may incur extra charges.', 2),
('Booking & Events', 'Do you offer international bookings?', 'Yes! We offer international bookings for festivals, events, and tours. International bookings require:
- Minimum 2-month advance booking
- Flight and accommodation arrangements
- Custom quote based on location and event scope

Contact us for specific international quotes.', 3),
('Booking & Events', 'What equipment does Danny bring?', 'We bring professional-grade equipment including:
- Pioneer CDJ-3000 turntables
- Pioneer DJM-900NXS2 mixer
- High-quality stereo sound systems (scalable to venue size)
- LED lighting effects
- Professional microphone and MC setup
- All necessary cables, adapters, and backup equipment

If your venue has existing equipment, we can discuss using it (conditions apply).', 4),
('Booking & Events', 'Can Danny do requests during the event?', 'Absolutely! We encourage song requests and integrate them into the set while maintaining the energy and flow of your event. We''re happy to:
- Play guest requests that fit the vibe
- Create do-not-play lists
- Build custom playlists ahead of time
- Adapt the music based on crowd energy in real-time', 5),
('Booking & Events', 'What''s your cancellation policy?', '- **30+ days notice**: Full refund minus £50 admin fee
- **14-30 days**: 50% of booking fee retained
- **7-14 days**: 75% of booking fee retained
- **Less than 7 days**: Full booking fee retained

Force majeure exceptions (illness, emergency) may be negotiated.', 6),
('Booking & Events', 'How much does a DJ booking cost?', 'Pricing varies by venue type and location:
- **Club bookings**: £600-£1,500
- **Private events**: £800-£2,500
- **Corporate events**: £2,000-£5,000
- **Festivals**: Negotiate per opportunity

Request a quote for your specific event to get accurate pricing.', 7),
('Booking & Events', 'Do you provide sound and lighting equipment?', 'Yes, we provide professional sound systems and lighting. For large venues, we can coordinate with venue-provided sound systems or bring our own premium setup. Specialized equipment (laser lights, projection, rigging) can be arranged for an additional fee.', 8),

-- MERCHANDISE (7)
('Merchandise', 'What merch products are available?', 'We offer a range of products including:
- **Apparel**: T-shirts, hoodies, jackets, hats
- **Physical Media**: Vinyl records, CDs, cassettes
- **Accessories**: Stickers, badges, wristbands
- **Limited editions**: Seasonal drops and exclusive designs
- **Sound packs**: DJ tools and production samples
- **Branded items**: Water bottles, posters, phone cases

Visit our shop to see current inventory.', 9),
('Merchandise', 'How long does shipping take?', 'Standard UK shipping takes **3-5 business days** after order processing. Express shipping (1-2 business days) is available for £10 extra. International orders typically take **7-14 business days** depending on destination.', 10),
('Merchandise', 'Do you ship internationally?', 'Yes! We ship to most countries worldwide. International shipping rates vary by location and weight:
- **Europe**: £8-15
- **USA/Canada**: £15-25
- **Australia/Asia**: £20-30
- **Other regions**: Custom quote

Customs duties may apply depending on destination.', 11),
('Merchandise', 'How is merch quality?', 'All merchandise is sourced from premium suppliers:
- **Apparel**: High-quality cotton and blended fabrics
- **Vinyl**: Pressed on 180g black vinyl with full artwork
- **Accessories**: Durable, fade-resistant printing
- **Packaging**: Eco-friendly materials with care instructions

We guarantee satisfaction or full refunds within 30 days.', 12),
('Merchandise', 'Can I return or exchange merch?', 'Returns and exchanges are accepted within **30 days** of purchase if items are unworn/unused with original tags attached. To return:
1. Contact us with order number
2. Ship item back (prepaid label available)
3. Receive refund or exchange

Note: Customized or personalized items cannot be returned.', 13),
('Merchandise', 'Do you offer bulk discounts?', 'Yes! We offer bulk discounts for:
- **10-25 items**: 10% off
- **25-50 items**: 15% off
- **50+ items**: 20% off (custom quote)

Ideal for events, promotions, and team orders. Contact us for bulk pricing.', 14),
('Merchandise', 'What payment methods do you accept?', 'We accept:
- Credit/debit cards (Visa, Mastercard, Amex)
- PayPal
- Bank transfers
- Apple Pay / Google Pay

All transactions are secure and encrypted.', 15),

-- TECHNICAL SUPPORT (5)
('Technical', 'Does my payment data get stored on your servers?', 'No. We use **PCI-compliant payment processors (Stripe & PayPal)** to handle all payment data. Your credit card information is never stored on our servers. We only store:
- Order confirmation
- Transaction ID
- Email address

Your data is protected by industry-standard encryption.', 16),
('Technical', 'Is this site mobile-friendly?', 'Yes, our website is fully responsive and mobile-optimized. You can:
- Browse the shop on mobile
- Stream mixes and shows
- Book events
- Make payments
- Check order status

Works seamlessly on all devices (phone, tablet, desktop).', 17),
('Technical', 'How do you handle refunds?', 'Refunds are processed as follows:
1. **Product refunds**: Full refund minus shipping (within 30 days)
2. **Booking cancellations**: Per our cancellation policy
3. **Payment disputes**: Processed via Stripe/PayPal within 5-7 business days
4. **Processing time**: Refunds appear in your account within 3-5 business days

For specific refund issues, contact support@djdannyhecticb.com', 18),
('Technical', 'What payment methods do you accept?', 'We accept multiple payment methods:
- **Credit/debit cards**: Visa, Mastercard, American Express
- **PayPal**: Secure PayPal payments
- **Bank transfers**: Direct bank account transfers (by arrangement)
- **Digital wallets**: Apple Pay, Google Pay

All payments are encrypted and processed securely.', 19),
('Technical', 'How can I track my order?', 'Once your order ships, you''ll receive:
- Email confirmation with tracking number
- Direct link to track shipment
- Real-time delivery updates
- Estimated delivery window

You can also check order status in your account dashboard anytime.', 20),

-- SHIPPING (5)
('Shipping', 'How much does shipping cost?', 'Shipping rates:
- **UK Standard**: FREE for orders over £50, £3 for orders under £50
- **UK Express**: £8 (1-2 business days)
- **Europe**: £8-15 depending on country
- **International**: £15-30+ depending on destination
- **Special items** (vinyl, heavy items): May have additional fees', 21),
('Shipping', 'Where do you ship to?', 'We ship to:
- **UK**: All postcodes including Scottish Highlands
- **Europe**: All EU countries plus UK/Ireland
- **Worldwide**: USA, Canada, Australia, Asia, and most other countries
- **Excluded**: A few restricted countries (check at checkout)

International orders may be subject to customs duties.', 22),
('Shipping', 'How long does delivery take?', 'Delivery times (from dispatch):
- **UK Standard**: 3-5 business days
- **UK Express**: 1-2 business days
- **Europe**: 5-10 business days
- **USA**: 7-14 business days
- **Australia/Asia**: 10-21 business days

Holidays and weekends are excluded from estimates.', 23),
('Shipping', 'Can I change my shipping address?', 'You can change your address **before shipment** (usually within 24 hours of ordering):
1. Log into your account
2. Go to order details
3. Click "Change address" if available
4. Or email us immediately with the new address

Once shipped, you may need to arrange a redirect or return.', 24),
('Shipping', 'Do you offer tracking?', 'Yes! All orders include:
- **Tracking number** sent via email
- **Live tracking link** to monitor progress
- **SMS notifications** (optional) for key updates
- **Estimated delivery date**

Track your order anytime from your account or email link.', 25),

-- GENERAL (5)
('General', 'Who is DJ Danny Hectic B?', 'DJ Danny Hectic B is a London-based DJ specializing in electronic music, drum & bass, and garage. He''s known for:
- **High-energy sets** with crowd-pleasing vibes
- **Radio shows** on Hectic Radio
- **Professional bookings** at top London clubs and international festivals
- **Exclusive mixes** and production
- **Community engagement** with fans and followers

Learn more on our about page.', 26),
('General', 'What''s your contact info?', 'Get in touch:
- **Email**: contact@djdannyhecticb.com
- **Instagram**: [@djdannyhecticb](https://instagram.com/djdannyhecticb)
- **Phone**: +44 (0)XXXX XXXXXX
- **Contact form**: Contact page

Response time: 24-48 hours for inquiries.', 27),
('General', 'How can I follow you on social media?', 'Follow us on:
- **Instagram**: [@djdannyhecticb](https://instagram.com/djdannyhecticb) - Daily stories, clips, mixes
- **TikTok**: [@djdannyhecticb](https://tiktok.com/@djdannyhecticb) - Short clips and trends
- **YouTube**: DJ Danny Hectic B - Full mixes and performances
- **Soundcloud**: DJ Danny Hectic B - Exclusive mixes
- **Spotify**: DJ Danny Hectic B - Curated playlists', 28),
('General', 'Do you have public liability insurance?', 'Yes, we carry **full public liability insurance**. Certificates can be provided upon request for:
- Event bookings
- Venue requirements
- Corporate functions
- Festival participation

This ensures professional standards and protects all parties.', 29),
('General', 'Can you provide references or testimonials?', 'Absolutely! Check out our:
- **Testimonials page** - Client feedback and reviews
- **Portfolio** - Past bookings and events
- **Social proof** - Customer reviews on Instagram and website

We''re happy to provide direct references from past clients upon request.', 30);
