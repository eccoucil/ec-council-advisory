import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 45 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtp() {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

export function hashOtp(code: string, binding: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return createHmac("sha256", secret)
    .update(`${binding}:${code.trim()}`)
    .digest("hex");
}

export function otpMatches(code: string, codeHash: string, binding: string) {
  const actual = Buffer.from(hashOtp(code, binding));
  const expected = Buffer.from(codeHash);

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function emailBinding(memberId: number, email: string) {
  return `${memberId}:${email.trim().toLowerCase()}`;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "your email";
  }

  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}
