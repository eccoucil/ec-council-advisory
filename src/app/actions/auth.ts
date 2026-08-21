"use server";

import { redirect } from "next/navigation";
import {
  clearAccessIntent,
  getAccessIntent,
  setAccessIntent,
} from "@/lib/access-intent";
import { sendAccessCodeEmail } from "@/lib/mail";
import {
  emailBinding,
  generateOtp,
  hashOtp,
  maskEmail,
  otpMatches,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
} from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";

export type BindMemberResult =
  | { ok: true; name: string; title: string }
  | { ok: false; error: string };

export type RequestOtpResult =
  | { ok: true; name: string; maskedEmail: string }
  | { ok: false; error: string };

export type VerifyOtpResult = { ok: false; error: string };

async function memberFromAccessIntent() {
  const intent = await getAccessIntent();
  if (!intent) {
    return null;
  }

  return prisma.advisoryBoardMember.findUnique({
    where: { id: intent.memberId },
    select: { id: true, name: true, title: true, email: true },
  });
}

export async function bindMember(memberId: number): Promise<BindMemberResult> {
  if (!Number.isInteger(memberId) || memberId < 1) {
    return { ok: false, error: "Select your name from the board list." };
  }

  const member = await prisma.advisoryBoardMember.findUnique({
    where: { id: memberId },
    select: { id: true, name: true, title: true },
  });

  if (!member) {
    return { ok: false, error: "That board member could not be found." };
  }

  await setAccessIntent(member.id);
  return { ok: true, name: member.name, title: member.title };
}

export async function requestOtp(): Promise<RequestOtpResult> {
  const member = await memberFromAccessIntent();
  if (!member) {
    return { ok: false, error: "Select your name from the board list." };
  }

  const email = member.email?.trim().toLowerCase();
  if (!email) {
    return {
      ok: false,
      error:
        "An access code cannot be sent until an email is on file for this member.",
    };
  }

  const latest = await prisma.otpChallenge.findFirst({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
  });

  if (
    latest &&
    Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    return {
      ok: false,
      error: "Wait a moment before requesting another code.",
    };
  }

  const code = generateOtp();
  const binding = emailBinding(member.id, email);
  const challenge = await prisma.otpChallenge.create({
    data: {
      memberId: member.id,
      emailSentTo: email,
      codeHash: hashOtp(code, binding),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  try {
    await sendAccessCodeEmail({ to: email, name: member.name, code });
  } catch (error) {
    await prisma.otpChallenge.delete({ where: { id: challenge.id } });
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The access code could not be sent. Try again shortly.",
    };
  }

  return {
    ok: true,
    name: member.name,
    maskedEmail: maskEmail(email),
  };
}

export async function verifyOtp(code: string): Promise<VerifyOtpResult> {
  const normalized = code.replace(/\D/g, "");
  if (normalized.length !== 6) {
    return { ok: false, error: "Enter the 6-digit code from your email." };
  }

  const member = await memberFromAccessIntent();
  const email = member?.email?.trim().toLowerCase();
  if (!member || !email) {
    return { ok: false, error: "This access request is no longer valid." };
  }

  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      memberId: member.id,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge) {
    return {
      ok: false,
      error: "That code has expired. Select your name to request a new one.",
    };
  }

  if (challenge.emailSentTo !== email) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return {
      ok: false,
      error: "This access request is no longer valid. Request a new code.",
    };
  }

  if (challenge.attemptCount >= OTP_MAX_ATTEMPTS) {
    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    return {
      ok: false,
      error: "Too many attempts. Select your name to request a new code.",
    };
  }

  const updated = await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attemptCount: { increment: 1 } },
  });

  const binding = emailBinding(member.id, email);
  if (!otpMatches(normalized, challenge.codeHash, binding)) {
    if (updated.attemptCount >= OTP_MAX_ATTEMPTS) {
      await prisma.otpChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: new Date() },
      });
    }

    return { ok: false, error: "That code is incorrect. Try again." };
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });

  await clearAccessIntent();
  await createSession({
    memberId: member.id,
    name: member.name,
    email,
  });

  redirect("/board");
}

export async function signOut() {
  await clearAccessIntent();
  await destroySession();
  redirect("/");
}
