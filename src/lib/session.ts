import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ecc_board_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** Mirrors the Prisma `MemberRole` enum, declared locally so the proxy does
 * not have to pull the Prisma client into its bundle. */
export type SessionRole = "MEMBER" | "ADMIN";

export type Session = {
  memberId: number;
  name: string;
  email: string;
  role: SessionRole;
};

export function homeForRole(role: SessionRole) {
  return role === "ADMIN" ? "/admin" : "/board";
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(session: Session) {
  const token = await new SignJWT({
    name: session.name,
    email: session.email,
    role: session.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(session.memberId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token || !process.env.AUTH_SECRET) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const memberId = Number(payload.sub);
    const name = typeof payload.name === "string" ? payload.name : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    // Tokens issued before roles existed carry no claim; the safe reading is
    // the unprivileged one.
    const role: SessionRole = payload.role === "ADMIN" ? "ADMIN" : "MEMBER";

    if (!Number.isInteger(memberId) || memberId < 1 || !email) {
      return null;
    }

    return { memberId, name, email, role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}
