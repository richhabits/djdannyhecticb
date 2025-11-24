import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { Express, Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/node';

/**
 * Enterprise-level security middleware configuration
 */

// Initialize Sentry for error tracking
export function initSentry(app: Express) {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      environment: process.env.NODE_ENV || 'development',
    });

    // Request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
  }
}

// Sentry error handler (should be added after all other middleware)
export function getSentryErrorHandler() {
  return Sentry.Handlers.errorHandler();
}

// CORS configuration
export function getCorsOptions() {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://djdannyhectib.com',
    'https://www.djdannyhectib.com',
    process.env.APP_URL,
  ].filter(Boolean) as string[];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });
}

// Helmet security headers configuration
export function getHelmetOptions() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'", // Required for some React development tools
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://js.stripe.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "*.githubusercontent.com",
          "*.cloudinary.com",
          "*.s3.amazonaws.com",
        ],
        connectSrc: [
          "'self'",
          "https://api.stripe.com",
          "https://www.google-analytics.com",
          "https://sentry.io",
          "wss://",
          "https://api.instagram.com",
          "https://graph.facebook.com",
          "https://www.youtube.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'", "https:", "blob:"],
        frameSrc: [
          "'self'",
          "https://js.stripe.com",
          "https://www.youtube.com",
          "https://www.instagram.com",
          "https://www.facebook.com",
          "https://player.twitch.tv",
        ],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for embedding external content
  });
}

// Rate limiting configurations
export const rateLimiters = {
  // General API rate limit
  general: rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limit for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
  }),

  // Rate limit for booking creation
  booking: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 bookings per hour
    message: 'Too many booking requests, please try again later.',
  }),

  // Rate limit for file uploads
  upload: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 uploads per windowMs
    message: 'Too many file uploads, please try again later.',
  }),

  // Rate limit for email sending
  email: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 emails per hour
    message: 'Too many email requests, please try again later.',
  }),
};

// XSS Protection middleware
export function xssProtection(req: Request, res: Response, next: NextFunction) {
  // Set X-XSS-Protection header
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Sanitize request body, query, and params
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention - remove script tags and event handlers
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);

  next();
}

// CSRF Token validation middleware
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and public endpoints
  if (req.method === 'GET' || req.path.startsWith('/api/public')) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// SQL Injection prevention helper
export function sanitizeSQLInput(input: string): string {
  if (!input) return '';
  
  // Remove or escape potentially dangerous SQL characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes, semicolons, and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove multi-line comment start
    .replace(/\*\//g, '') // Remove multi-line comment end
    .trim();
}

// Input validation middleware factory
export function validateInput(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validation = schema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }
    
    req.body = validation.data;
    next();
  };
}

// Security headers for API responses
export function apiSecurityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}

// IP blocking middleware for known malicious IPs
const blockedIPs = new Set<string>();

export function ipBlocker(req: Request, res: Response, next: NextFunction) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (clientIP && blockedIPs.has(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  next();
}

// Function to add IP to blocklist
export function blockIP(ip: string) {
  blockedIPs.add(ip);
}

// Function to remove IP from blocklist
export function unblockIP(ip: string) {
  blockedIPs.delete(ip);
}

// Export all security middleware as a single setup function
export function setupSecurity(app: Express) {
  // Initialize Sentry
  initSentry(app);
  
  // Apply security middleware
  app.use(getHelmetOptions());
  app.use(getCorsOptions());
  app.use(xssProtection);
  app.use(apiSecurityHeaders);
  app.use(ipBlocker);
  
  // Apply rate limiting to all routes
  app.use('/api/', rateLimiters.general);
  
  // Apply specific rate limiters to specific routes
  app.use('/api/auth/', rateLimiters.auth);
  app.use('/api/bookings/', rateLimiters.booking);
  app.use('/api/upload/', rateLimiters.upload);
  app.use('/api/email/', rateLimiters.email);
  
  console.log('✅ Security middleware configured');
}