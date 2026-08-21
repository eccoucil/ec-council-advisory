import { afterEach, describe, expect, it } from "vitest";
import {
  OTP_LENGTH,
  emailBinding,
  generateOtp,
  hashOtp,
  maskEmail,
  otpMatches,
} from "@/lib/otp";

const SECRET = process.env.AUTH_SECRET;

afterEach(() => {
  process.env.AUTH_SECRET = SECRET;
});

describe("generateOtp", () => {
  it("returns a zero-padded numeric code of OTP_LENGTH", () => {
    for (let i = 0; i < 200; i += 1) {
      const code = generateOtp();
      expect(code).toHaveLength(OTP_LENGTH);
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});

describe("hashOtp", () => {
  it("throws when AUTH_SECRET is absent", () => {
    delete process.env.AUTH_SECRET;
    expect(() => hashOtp("123456", "1:a@b.com")).toThrow("AUTH_SECRET is not set");
  });

  it("is deterministic for the same code and binding", () => {
    expect(hashOtp("123456", "1:a@b.com")).toBe(hashOtp("123456", "1:a@b.com"));
  });

  it("ignores surrounding whitespace on the code", () => {
    expect(hashOtp("  123456 ", "1:a@b.com")).toBe(hashOtp("123456", "1:a@b.com"));
  });

  it("separates the same code across different bindings", () => {
    expect(hashOtp("123456", "1:a@b.com")).not.toBe(hashOtp("123456", "2:a@b.com"));
  });
});

describe("otpMatches", () => {
  it("accepts the code it was derived from", () => {
    const binding = emailBinding(7, "Board@Example.com");
    expect(otpMatches("428913", hashOtp("428913", binding), binding)).toBe(true);
  });

  it("rejects a different code", () => {
    const binding = emailBinding(7, "board@example.com");
    expect(otpMatches("000000", hashOtp("428913", binding), binding)).toBe(false);
  });

  it("rejects a correct code replayed against another member's binding", () => {
    const stored = hashOtp("428913", emailBinding(7, "board@example.com"));
    expect(otpMatches("428913", stored, emailBinding(8, "board@example.com"))).toBe(false);
  });

  it("returns false rather than throwing on a truncated hash", () => {
    const binding = emailBinding(7, "board@example.com");
    expect(otpMatches("428913", "deadbeef", binding)).toBe(false);
  });
});

describe("emailBinding", () => {
  it("normalises case and whitespace so lookup and verify agree", () => {
    expect(emailBinding(12, "  Board@Example.COM ")).toBe("12:board@example.com");
  });
});

describe("maskEmail", () => {
  it("keeps the first and last local characters", () => {
    expect(maskEmail("alice@example.com")).toBe("a••••e@example.com");
  });

  it("handles a single-character local part without leaking it twice", () => {
    expect(maskEmail("a@b.com")).toBe("a••••@b.com");
  });

  it("falls back when the value is not an email", () => {
    expect(maskEmail("notanemail")).toBe("your email");
    expect(maskEmail("@example.com")).toBe("your email");
  });
});
