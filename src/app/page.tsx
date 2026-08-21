import { prisma } from "@/lib/prisma";
import { MemberAccess } from "@/components/member-access";

export default async function Home() {
  const members = await prisma.advisoryBoardMember.findMany({
    select: { id: true, name: true, title: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="gate">
      <section className="gate-brief">
        <p className="eyebrow">EC-Council · Restricted</p>
        <h1>
          Artificial Intelligence
          <span>Advisory Board</span>
        </h1>
        <p>
          Voices from global leaders who guide EC-Council initiatives in AI
          security. Access is issued only to seated members, and only after a
          one-time code reaches the email on file.
        </p>
        <dl>
          <div>
            <dt>Seated</dt>
            <dd>{members.length}</dd>
          </div>
          <div>
            <dt>Clearance</dt>
            <dd>OTP</dd>
          </div>
        </dl>
      </section>

      <section className="gate-access">
        <MemberAccess members={members} />
      </section>
    </main>
  );
}
