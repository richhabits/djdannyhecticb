import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the env module before importing email
vi.mock("./env", () => ({
  ENV: {
    SENDGRID_API_KEY: "",
    MAILCHIMP_API_KEY: "",
    MAILCHIMP_SERVER_PREFIX: "",
    MAILCHIMP_LIST_ID: "",
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  sendWithSendGrid,
  addToMailchimpList,
  emailTemplates,
  EmailService,
} from "./email";

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.SENDGRID_API_KEY;
    delete process.env.MAILCHIMP_API_KEY;
    delete process.env.MAILCHIMP_SERVER_PREFIX;
    delete process.env.MAILCHIMP_LIST_ID;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendWithSendGrid", () => {
    it("should return error when API key is not configured", async () => {
      const result = await sendWithSendGrid({
        to: { email: "test@example.com" },
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("SendGrid not configured");
    });

    it("should send email successfully with valid API key", async () => {
      process.env.SENDGRID_API_KEY = "test-api-key";
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
        headers: new Map([["X-Message-Id", "test-message-id"]]),
      });

      const result = await sendWithSendGrid({
        to: { email: "test@example.com", name: "Test User" },
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendgrid.com/v3/mail/send",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-api-key",
          }),
        })
      );
    });

    it("should handle SendGrid API errors", async () => {
      process.env.SENDGRID_API_KEY = "test-api-key";
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad request",
      });

      const result = await sendWithSendGrid({
        to: { email: "test@example.com" },
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Bad request");
    });

    it("should handle multiple recipients", async () => {
      process.env.SENDGRID_API_KEY = "test-api-key";
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
        headers: new Map(),
      });

      await sendWithSendGrid({
        to: [
          { email: "user1@example.com" },
          { email: "user2@example.com" },
        ],
        subject: "Test",
        html: "<p>Test</p>",
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.personalizations).toHaveLength(2);
    });
  });

  describe("addToMailchimpList", () => {
    it("should return error when Mailchimp is not configured", async () => {
      const result = await addToMailchimpList({
        email: "test@example.com",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Mailchimp not configured");
    });

    it("should add subscriber successfully", async () => {
      process.env.MAILCHIMP_API_KEY = "test-api-key";
      process.env.MAILCHIMP_SERVER_PREFIX = "us1";
      process.env.MAILCHIMP_LIST_ID = "list123";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "subscriber123" }),
      });

      const result = await addToMailchimpList({
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        tags: ["newsletter"],
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("subscriber123");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://us1.api.mailchimp.com/3.0/lists/list123/members",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    it("should handle already subscribed users", async () => {
      process.env.MAILCHIMP_API_KEY = "test-api-key";
      process.env.MAILCHIMP_SERVER_PREFIX = "us1";
      process.env.MAILCHIMP_LIST_ID = "list123";

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ title: "Member Exists", id: "existing123" }),
      });

      const result = await addToMailchimpList({
        email: "test@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.error).toBe("Already subscribed");
    });
  });

  describe("emailTemplates", () => {
    it("should generate welcome email template", () => {
      const template = emailTemplates.welcome("John");

      expect(template.subject).toContain("Welcome");
      expect(template.html).toContain("Hey John!");
      expect(template.html).toContain("Hectic Radio");
    });

    it("should generate booking confirmation template", () => {
      const template = emailTemplates.bookingConfirmation({
        name: "John",
        eventDate: "2024-02-15",
        eventType: "Club Night",
        location: "London",
      });

      expect(template.subject).toContain("Booking");
      expect(template.html).toContain("John");
      expect(template.html).toContain("2024-02-15");
      expect(template.html).toContain("Club Night");
      expect(template.html).toContain("London");
    });

    it("should generate new mix alert template", () => {
      const template = emailTemplates.newMixAlert({
        name: "John",
        mixTitle: "Summer Vibes 2024",
        mixUrl: "https://example.com/mix",
        genre: "House",
      });

      expect(template.subject).toContain("Summer Vibes 2024");
      expect(template.html).toContain("John");
      expect(template.html).toContain("House");
      expect(template.html).toContain("https://example.com/mix");
    });
  });

  describe("EmailService class", () => {
    it("should use console provider when no API keys configured", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const service = new EmailService();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No email provider configured")
      );
    });

    it("should use SendGrid when SENDGRID_API_KEY is set", () => {
      process.env.SENDGRID_API_KEY = "test-key";
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const service = new EmailService();
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should log emails to console when no provider configured", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.send({
        to: { email: "test@example.com" },
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith(
        "[Email] Would send:",
        expect.objectContaining({ subject: "Test" })
      );
    });

    it("should subscribe to newsletter", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "warn").mockImplementation(() => {});
      
      const service = new EmailService();
      const result = await service.subscribeToNewsletter(
        "test@example.com",
        "John Doe",
        ["music-lover"]
      );

      expect(result.success).toBe(true);
    });
  });
});

describe("Email Template HTML validation", () => {
  it("should include unsubscribe link in welcome email", () => {
    const template = emailTemplates.welcome("Test");
    expect(template.html).toContain("unsubscribe");
  });

  it("should include user-provided content in template", () => {
    // Note: HTML sanitization should be done at the input layer, 
    // not in the email template. Template just renders the provided name.
    const template = emailTemplates.welcome("John Doe");
    expect(template.html).toContain("John Doe");
  });

  it("should include proper email structure", () => {
    const template = emailTemplates.welcome("Test");
    expect(template.html).toContain("<!DOCTYPE html>");
    expect(template.html).toContain("<html>");
    expect(template.html).toContain("</html>");
    expect(template.html).toContain("<body>");
    expect(template.html).toContain("</body>");
  });
});
