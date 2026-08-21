import { redirect } from "next/navigation";
import { OtpAccess } from "@/components/otp-access";
import { getAccessIntent } from "@/lib/access-intent";
import { maskEmail, OTP_LENGTH, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export default async function OtpPage() {
  const intent = await getAccessIntent();
  if (!intent) {
    redirect("/");
  }

  const member = await prisma.advisoryBoardMember.findUnique({
    where: { id: intent.memberId },
    select: { id: true, name: true, email: true },
  });

  const email = member?.email?.trim();
  if (!member || !email) {
    redirect("/");
  }

  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      memberId: member.id,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { expiresAt: true, attemptCount: true },
  });

  if (!challenge) {
    redirect("/");
  }

  return (
    <OtpAccess
      name={member.name}
      maskedEmail={maskEmail(email)}
      codeLength={OTP_LENGTH}
      expiresAt={challenge.expiresAt.toISOString()}
      attemptCount={challenge.attemptCount}
      maxAttempts={OTP_MAX_ATTEMPTS}
    />
  );
}
