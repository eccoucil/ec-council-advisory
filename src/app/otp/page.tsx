import { redirect } from "next/navigation";
import { OtpForm } from "@/components/otp-form";
import { getAccessIntent } from "@/lib/access-intent";
import { maskEmail } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

export default async function OtpPage() {
  const intent = await getAccessIntent();
  if (!intent) {
    redirect("/");
  }

  const member = await prisma.advisoryBoardMember.findUnique({
    where: { id: intent.memberId },
    select: { name: true, email: true },
  });

  const email = member?.email?.trim();
  if (!member || !email) {
    redirect("/");
  }

  return (
    <main className="gate">
      <section className="gate-brief">
        <p className="eyebrow">EC-Council · Restricted</p>
        <h1>
          Enter your
          <span>access code</span>
        </h1>
        <p>
          The code was sent to the email on file for this board member. It
          expires in 10 minutes.
        </p>
      </section>

      <section className="gate-access">
        <OtpForm name={member.name} maskedEmail={maskEmail(email)} />
      </section>
    </main>
  );
}
