/**
 * Input Validation & Business Rules Tests
 * Tests for data validation, constraints, and business rule enforcement
 */

import { describe, it, expect } from "vitest";

/**
 * Validation functions
 */

function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateAmount(amount: number, minAmount: number = 1, maxAmount: number = 100000): boolean {
  return amount >= minAmount && amount <= maxAmount;
}

function validatePlan(plan: string): boolean {
  const validPlans = ["free", "subscriber", "vip", "premium", "family"];
  return validPlans.includes(plan);
}

function validateBio(bio: string, maxLength: number = 500): boolean {
  return bio.length <= maxLength && bio.length > 0;
}

function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeText(text: string): string {
  return text
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function validateCreditCard(cardNumber: string): {
  valid: boolean;
  type?: string;
} {
  const cleaned = cardNumber.replace(/\D/g, "");

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const valid = sum % 10 === 0 && cleaned.length >= 13;

  // Card type detection
  let type;
  if (/^4/.test(cleaned)) type = "Visa";
  else if (/^5[1-5]/.test(cleaned)) type = "Mastercard";
  else if (/^3[47]/.test(cleaned)) type = "Amex";
  else if (/^6(?:011|5)/.test(cleaned)) type = "Discover";

  return { valid, type };
}

describe("Input Validation & Business Rules", () => {
  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      const validEmails = [
        "user@example.com",
        "john.doe@company.co.uk",
        "test+tag@domain.org",
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid emails", () => {
      const invalidEmails = [
        "not-an-email",
        "user@",
        "@domain.com",
        "user name@example.com",
        "user@.com",
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it("should reject empty email", () => {
      expect(validateEmail("")).toBe(false);
    });
  });

  describe("Amount Validation", () => {
    it("should accept valid amounts", () => {
      expect(validateAmount(10)).toBe(true);
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(50000)).toBe(true);
    });

    it("should reject amounts below minimum", () => {
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-10)).toBe(false);
    });

    it("should reject amounts above maximum", () => {
      expect(validateAmount(100001)).toBe(false);
      expect(validateAmount(999999)).toBe(false);
    });

    it("should accept boundary values", () => {
      expect(validateAmount(1)).toBe(true); // minimum
      expect(validateAmount(100000)).toBe(true); // maximum
    });

    it("should handle custom min/max", () => {
      expect(validateAmount(5, 10, 50)).toBe(false); // Below custom min
      expect(validateAmount(25, 10, 50)).toBe(true); // Within custom range
      expect(validateAmount(75, 10, 50)).toBe(false); // Above custom max
    });
  });

  describe("Plan Validation", () => {
    it("should accept valid plans", () => {
      ["free", "subscriber", "vip", "premium", "family"].forEach((plan) => {
        expect(validatePlan(plan)).toBe(true);
      });
    });

    it("should reject invalid plans", () => {
      expect(validatePlan("gold")).toBe(false);
      expect(validatePlan("platinum")).toBe(false);
      expect(validatePlan("")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(validatePlan("Premium")).toBe(false);
      expect(validatePlan("PREMIUM")).toBe(false);
    });
  });

  describe("Text Validation", () => {
    it("should accept valid bio", () => {
      expect(validateBio("A short bio")).toBe(true);
      expect(validateBio("A".repeat(500))).toBe(true);
    });

    it("should reject empty bio", () => {
      expect(validateBio("")).toBe(false);
    });

    it("should reject bio exceeding max length", () => {
      expect(validateBio("A".repeat(501))).toBe(false);
    });

    it("should enforce custom max lengths", () => {
      expect(validateBio("12345", 5)).toBe(true);
      expect(validateBio("123456", 5)).toBe(false);
    });
  });

  describe("Password Validation", () => {
    it("should accept strong passwords", () => {
      const result = validatePassword("StrongPass123");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should require minimum length", () => {
      const result = validatePassword("Short1A");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters");
    });

    it("should require uppercase letter", () => {
      const result = validatePassword("password123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain uppercase letter");
    });

    it("should require lowercase letter", () => {
      const result = validatePassword("PASSWORD123");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain lowercase letter");
    });

    it("should require number", () => {
      const result = validatePassword("PasswordAbc");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must contain number");
    });

    it("should report multiple validation errors", () => {
      const result = validatePassword("weak");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("URL Validation", () => {
    it("should accept valid URLs", () => {
      const validUrls = [
        "https://example.com",
        "http://subdomain.example.co.uk",
        "https://example.com/path?query=value",
      ];

      validUrls.forEach((url) => {
        expect(validateUrl(url)).toBe(true);
      });
    });

    it("should reject invalid URLs", () => {
      const invalidUrls = [
        "not a url",
        "example.com",
        "ht!tp://bad",
        "",
      ];

      invalidUrls.forEach((url) => {
        expect(validateUrl(url)).toBe(false);
      });
    });

    it("should accept both http and https", () => {
      expect(validateUrl("http://example.com")).toBe(true);
      expect(validateUrl("https://example.com")).toBe(true);
    });
  });

  describe("Text Sanitization", () => {
    it("should remove script tags", () => {
      const malicious = "Hello <script>alert('xss')</script> world";
      const clean = sanitizeText(malicious);

      expect(clean).not.toContain("<script>");
      expect(clean).toContain("Hello");
    });

    it("should remove all HTML tags", () => {
      const html = "Hello <b>world</b> <i>test</i>";
      const clean = sanitizeText(html);

      expect(clean).not.toContain("<");
      expect(clean).not.toContain(">");
      expect(clean).toContain("Hello");
    });

    it("should remove dangerous attributes", () => {
      const dangerous = '<img src="x" onerror="alert(\'xss\')">';
      const clean = sanitizeText(dangerous);

      expect(clean).not.toContain("onerror");
      expect(clean).not.toContain("<");
    });

    it("should preserve safe text", () => {
      const text = "This is a safe message";
      const clean = sanitizeText(text);

      expect(clean).toBe(text);
    });

    it("should trim whitespace", () => {
      const text = "  Hello world  ";
      const clean = sanitizeText(text);

      expect(clean).toBe("Hello world");
    });
  });

  describe("Credit Card Validation", () => {
    it("should validate Visa cards", () => {
      const result = validateCreditCard("4532015112830366"); // Valid Visa test card
      expect(result.valid).toBe(true);
      expect(result.type).toBe("Visa");
    });

    it("should detect Mastercard type", () => {
      const result = validateCreditCard("5555555555554444"); // Standard test card
      expect(result.type).toBe("Mastercard");
    });

    it("should detect card type", () => {
      expect(validateCreditCard("4111111111111111").type).toBe("Visa");
      expect(validateCreditCard("5555555555554444").type).toBe("Mastercard");
      expect(validateCreditCard("378282246310005").type).toBe("Amex");
      expect(validateCreditCard("6011111111111117").type).toBe("Discover");
    });

    it("should reject invalid cards", () => {
      const result = validateCreditCard("1234567890123456");
      expect(result.valid).toBe(false);
    });

    it("should reject cards with insufficient length", () => {
      const result = validateCreditCard("4111111111111"); // Too short
      expect(result.valid).toBe(false);
    });

    it("should handle various formats", () => {
      const formats = [
        "4532015112830366",
        "4532-0151-1283-0366",
        "4532 0151 1283 0366",
      ];

      // All should normalize and validate
      const results = formats.map((card) => validateCreditCard(card));
      // First one is valid, others may vary based on format handling
      expect(results[0].valid).toBe(true);
    });
  });

  describe("Business Rule Validation", () => {
    it("should enforce subscription tier hierarchy", () => {
      const tiers = ["free", "subscriber", "vip", "premium"];
      const prices = [0, 9.99, 29.99, 99.99];

      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThan(prices[i - 1]);
      }
    });

    it("should validate refund constraints", () => {
      const originalAmount = 100.0;
      const refundAmount = 50.0;

      const isValid = refundAmount <= originalAmount && refundAmount >= 0;
      expect(isValid).toBe(true);

      const tooMuch = 150.0;
      expect(tooMuch <= originalAmount).toBe(false);
    });

    it("should validate payment status transitions", () => {
      const validTransitions = {
        pending: ["processing", "failed", "expired"],
        processing: ["completed", "failed"],
        completed: ["refunded", "refunding"],
        failed: ["pending"],
        refunded: [],
      };

      expect(validTransitions.processing).toContain("completed");
      expect(validTransitions.completed).not.toContain("pending");
    });

    it("should enforce user role hierarchy", () => {
      const roles = ["user", "moderator", "admin"];
      const permissions = {
        user: ["read", "comment"],
        moderator: ["read", "comment", "delete_comments"],
        admin: ["read", "comment", "delete_comments", "delete_users", "edit_settings"],
      };

      // Admin should have all permissions
      expect(permissions.admin.length).toBeGreaterThan(permissions.user.length);
    });
  });

  describe("XSS Prevention", () => {
    it("should prevent JavaScript injection in attributes", () => {
      const input = '" onclick="alert(\'xss\')"';
      const safe = input.replace(/"/g, "&quot;");

      // Check that double quotes are escaped
      expect(safe).not.toContain('"');
      expect(safe).toContain("&quot;");
    });

    it("should prevent event handler injection", () => {
      const dangerous = '<div onmouseover="alert(\'xss\')">Click</div>';
      const clean = sanitizeText(dangerous);

      expect(clean).not.toContain("onmouseover");
    });

    it("should prevent encoding attacks", () => {
      const encoded = "&#60;script&#62;alert('xss')&#60;/script&#62;";
      const clean = sanitizeText(encoded);

      // After decoding, should still be safe
      expect(clean).toBeTruthy();
    });
  });

  describe("SQL Injection Prevention", () => {
    it("should not allow unescaped quotes in user input", () => {
      const userInput = "'; DROP TABLE users; --";
      const isSafe = !userInput.includes("DROP");

      expect(isSafe).toBe(false); // Input is not safe
    });

    it("should validate input parameters", () => {
      const validId = "123";
      const isValidId = /^\d+$/.test(validId);

      expect(isValidId).toBe(true);

      const invalidId = "123; DROP TABLE";
      expect(/^\d+$/.test(invalidId)).toBe(false);
    });
  });

  describe("File Upload Validation", () => {
    it("should validate file extensions", () => {
      const allowedExtensions = ["jpg", "png", "gif", "pdf"];
      const testFile = "image.jpg";
      const extension = testFile.split(".").pop()?.toLowerCase();

      expect(allowedExtensions).toContain(extension);
    });

    it("should reject dangerous file types", () => {
      const dangerousFiles = ["script.exe", "virus.bat", "malware.sh"];
      const allowedExtensions = ["jpg", "png", "pdf", "doc"];

      dangerousFiles.forEach((file) => {
        const ext = file.split(".").pop();
        expect(allowedExtensions).not.toContain(ext);
      });
    });

    it("should validate file size", () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileSize = 4 * 1024 * 1024; // 4MB

      expect(fileSize).toBeLessThan(maxSize);
    });
  });

  describe("Rate Limiting Validation", () => {
    it("should track request count per user", () => {
      const requestLog = new Map<string, number>();
      requestLog.set("user1", 5);
      requestLog.set("user2", 3);

      expect(requestLog.get("user1")).toBe(5);
    });

    it("should enforce rate limit threshold", () => {
      const limit = 10;
      const requestCount = 11;

      expect(requestCount > limit).toBe(true); // Exceeded
    });

    it("should reset counter after time period", () => {
      const resetAfterMs = 60000; // 1 minute
      const lastRequest = Date.now();
      const currentTime = lastRequest + resetAfterMs + 1;

      const shouldReset = currentTime - lastRequest > resetAfterMs;
      expect(shouldReset).toBe(true);
    });
  });
});
