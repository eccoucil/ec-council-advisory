import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const ACCESS_INTENT_COOKIE = "ecc_access_intent";
const ACCESS_INTENT_MAX_AGE = 60 * 15;

export type AccessIntent = {
  memberId: number;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_INTENT_MAX_AGE,
  };
}

export async function setAccessIntent(memberId: number) {
  const token = await new SignJWT({ purpose: "otp-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(memberId))
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_INTENT_MAX_AGE}s`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(ACCESS_INTENT_COOKIE, token, cookieOptions());
}

export async function clearAccessIntent() {
  const jar = await cookies();
  jar.delete(ACCESS_INTENT_COOKIE);
}

export async function readAccessIntentToken(
  token: string | undefined,
): Promise<AccessIntent | null> {
  if (!token || !process.env.AUTH_SECRET) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== "otp-access") {
      return null;
    }

    const memberId = Number(payload.sub);
    if (!Number.isInteger(memberId) || memberId < 1) {
      return null;
    }

    return { memberId };
  } catch {
    return null;
  }
}

export async function getAccessIntent(): Promise<AccessIntent | null> {
  const jar = await cookies();
  return readAccessIntentToken(jar.get(ACCESS_INTENT_COOKIE)?.value);
}
