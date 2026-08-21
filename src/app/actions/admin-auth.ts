"use server";

import { redirect } from "next/navigation";
import { clearAccessIntent } from "@/lib/access-intent";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

export type AdminSignInResult = { ok: false; error: string };

const GENERIC_ERROR = "Those credentials were not accepted.";

const MAX_ATTEMPTS = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACKED_EMAILS = 1000;

/**
 * Per-email throttle. In-process only, so it resets on redeploy and does not
 * span instances — enough to blunt online guessing against a single box, not a
 * substitute for an edge rate limit.
 */
const attempts = new Map<string, { count: number; firstAt: number }>();

function tooManyAttempts(email: string) {
  const record = attempts.get(email);
  if (!record) {
    return false;
  }

  if (Date.now() - record.firstAt > ATTEMPT_WINDOW_MS) {
    attempts.delete(email);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function pruneAttempts() {
  const cutoff = Date.now() - ATTEMPT_WINDOW_MS;
  for (const [email, record] of attempts) {
    if (record.firstAt < cutoff) {
      attempts.delete(email);
    }
  }
}

function recordFailure(email: string) {
  // Failures against rotating addresses would otherwise grow the map forever.
  if (attempts.size > MAX_TRACKED_EMAILS) {
    pruneAttempts();
  }

  const record = attempts.get(email);
  if (!record || Date.now() - record.firstAt > ATTEMPT_WINDOW_MS) {
    attempts.set(email, { count: 1, firstAt: Date.now() });
    return;
  }

  record.count += 1;
}

export async function adminSignIn(
  email: string,
  password: string,
): Promise<AdminSignInResult> {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !password) {
    return { ok: false, error: "Enter your email and password." };
  }

  if (tooManyAttempts(normalized)) {
    return {
      ok: false,
      error: "Too many attempts. Try again in a few minutes.",
    };
  }

  const admin = await prisma.advisoryBoardMember.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true, role: true, passwordHash: true },
  });

  // A non-admin row is treated as no row at all, and verifyPassword still runs
  // so the response time does not separate the two cases.
  const matches = await verifyPassword(
    password,
    admin?.role === "ADMIN" ? admin.passwordHash : null,
  );

  if (!matches || !admin?.email) {
    recordFailure(normalized);
    return { ok: false, error: GENERIC_ERROR };
  }

  attempts.delete(normalized);
  await clearAccessIntent();
  await createSession({
    memberId: admin.id,
    name: admin.name,
    email: admin.email,
    role: "ADMIN",
  });

  redirect("/admin");
}
