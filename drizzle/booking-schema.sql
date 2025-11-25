-- Booking Calendar and Availability Management Schema

-- DJ Availability Table
CREATE TABLE IF NOT EXISTS dj_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  isAvailable BOOLEAN DEFAULT true,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_date (date),
  INDEX idx_availability (date, isAvailable),
  UNIQUE KEY unique_time_slot (date, startTime, endTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Time Slots Table
CREATE TABLE IF NOT EXISTS booking_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  date DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_date (date),
  INDEX idx_booking_status (status),
  UNIQUE KEY unique_booking_slot (date, startTime, endTime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Payments Table
CREATE TABLE IF NOT EXISTS booking_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  stripePaymentIntentId VARCHAR(255) UNIQUE,
  stripeCheckoutSessionId VARCHAR(255) UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  status ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  paymentMethod VARCHAR(50),
  receiptUrl VARCHAR(512),
  refundAmount DECIMAL(10, 2),
  refundReason TEXT,
  paidAt TIMESTAMP NULL,
  refundedAt TIMESTAMP NULL,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_payment_status (status),
  INDEX idx_stripe_payment (stripePaymentIntentId),
  INDEX idx_stripe_session (stripeCheckoutSessionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Blocked Dates Table (for holidays, personal time, etc.)
CREATE TABLE IF NOT EXISTS blocked_dates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  reason VARCHAR(255),
  isRecurring BOOLEAN DEFAULT false,
  recurringPattern ENUM('daily', 'weekly', 'monthly', 'yearly'),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_blocked_dates (startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Reminders Table
CREATE TABLE IF NOT EXISTS booking_reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  reminderType ENUM('email', 'sms', 'push') DEFAULT 'email',
  scheduledFor TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT false,
  sentAt TIMESTAMP NULL,
  error TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_scheduled (scheduledFor, sent),
  INDEX idx_booking_reminder (bookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Reviews Table
CREATE TABLE IF NOT EXISTS booking_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL UNIQUE,
  userId INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  isPublished BOOLEAN DEFAULT false,
  response TEXT,
  respondedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_rating (rating),
  INDEX idx_published (isPublished)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service Packages Table
CREATE TABLE IF NOT EXISTS service_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  basePrice DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  duration INT NOT NULL COMMENT 'Duration in minutes',
  setupTime INT DEFAULT 0 COMMENT 'Setup time in minutes',
  teardownTime INT DEFAULT 0 COMMENT 'Teardown time in minutes',
  maxGuests INT,
  includes JSON COMMENT 'Array of included features',
  addOns JSON COMMENT 'Available add-on options with prices',
  isActive BOOLEAN DEFAULT true,
  displayOrder INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (isActive),
  INDEX idx_display_order (displayOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Add-ons Table
CREATE TABLE IF NOT EXISTS booking_addons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bookingId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_booking_addon (bookingId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendar Events Table (for displaying on the public calendar)
CREATE TABLE IF NOT EXISTS calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  eventType ENUM('booking', 'public_event', 'livestream', 'podcast', 'maintenance') DEFAULT 'booking',
  startDateTime DATETIME NOT NULL,
  endDateTime DATETIME NOT NULL,
  location VARCHAR(255),
  isPublic BOOLEAN DEFAULT false,
  color VARCHAR(7) DEFAULT '#6B46C1' COMMENT 'Hex color for calendar display',
  bookingId INT,
  eventId INT,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_date_range (startDateTime, endDateTime),
  INDEX idx_public (isPublic),
  INDEX idx_event_type (eventType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Waitlist Table (for fully booked dates)
CREATE TABLE IF NOT EXISTS booking_waitlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  preferredDate DATE NOT NULL,
  alternativeDate1 DATE,
  alternativeDate2 DATE,
  eventType VARCHAR(100),
  estimatedGuests INT,
  notes TEXT,
  contacted BOOLEAN DEFAULT false,
  contactedAt TIMESTAMP NULL,
  status ENUM('waiting', 'contacted', 'booked', 'expired') DEFAULT 'waiting',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_preferred_date (preferredDate),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default service packages
INSERT INTO service_packages (name, description, basePrice, duration, setupTime, teardownTime, maxGuests, includes, isActive, displayOrder) VALUES
('Wedding Premium', 'Full day wedding DJ service with lighting and MC duties', 1500.00, 480, 120, 60, 250, '["Professional DJ Setup", "Dance Floor Lighting", "MC Services", "First Dance Coordination", "Sound System", "Wireless Microphones", "Online Planning Portal"]', true, 1),
('Club Night', '4-hour club DJ set with professional mixing', 500.00, 240, 60, 30, 500, '["Professional DJ Setup", "Club-grade Sound System", "Lighting Sync", "Music Library Access"]', true, 2),
('Private Party', 'Birthday parties and private celebrations', 800.00, 300, 60, 30, 100, '["Professional DJ Setup", "Party Lighting", "MC Services", "Request Management", "Sound System"]', true, 3),
('Corporate Event', 'Professional corporate event DJ service', 2000.00, 360, 90, 60, 300, '["Professional DJ Setup", "Premium Sound System", "Intelligent Lighting", "MC Services", "Wireless Microphones", "Event Coordination", "Backup Equipment"]', true, 4),
('Radio Show Guest Mix', 'Pre-recorded guest mix for radio shows', 200.00, 60, 0, 0, NULL, '["Professional Mix", "Mastering", "Track Listing", "Artist Bio", "Promotional Materials"]', true, 5),
('Live Stream Set', 'Live streaming DJ set from the studio', 300.00, 120, 30, 15, NULL, '["HD Video Stream", "Professional Audio", "Multi-camera Setup", "Chat Interaction", "Recording Included"]', true, 6);

-- Create views for common queries
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT 
  b.*,
  bs.date,
  bs.startTime,
  bs.endTime,
  bp.status as paymentStatus,
  bp.amount as paymentAmount
FROM bookings b
JOIN booking_slots bs ON b.id = bs.bookingId
LEFT JOIN booking_payments bp ON b.id = bp.bookingId
WHERE bs.date >= CURDATE()
  AND b.status IN ('pending', 'confirmed')
ORDER BY bs.date, bs.startTime;

CREATE OR REPLACE VIEW availability_calendar AS
SELECT 
  da.date,
  da.startTime,
  da.endTime,
  da.isAvailable,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM booking_slots bs 
      WHERE bs.date = da.date 
        AND bs.status = 'confirmed'
        AND (
          (bs.startTime <= da.startTime AND bs.endTime > da.startTime) OR
          (bs.startTime < da.endTime AND bs.endTime >= da.endTime) OR
          (bs.startTime >= da.startTime AND bs.endTime <= da.endTime)
        )
    ) THEN false
    WHEN EXISTS (
      SELECT 1 FROM blocked_dates bd
      WHERE da.date BETWEEN bd.startDate AND bd.endDate
    ) THEN false
    ELSE da.isAvailable
  END as actualAvailability
FROM dj_availability da
WHERE da.date >= CURDATE()
ORDER BY da.date, da.startTime;