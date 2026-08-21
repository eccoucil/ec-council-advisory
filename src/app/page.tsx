import { prisma } from "@/lib/prisma";
import { AccessGate } from "@/components/access-gate";
import { MemberAccess } from "@/components/member-access";

export default async function Home() {
  const members = await prisma.advisoryBoardMember.findMany({
    select: { id: true, name: true, title: true },
    orderBy: { name: "asc" },
  });

  return (
    <AccessGate
      figure="Fig. 01"
      section="Member access"
      kicker="Member roster"
      step="01 / 02"
      title={
        <>
          Artificial Intelligence
          <span>Advisory Board</span>
        </>
      }
      lede={`${members.length} global leaders who guide EC-Council's work in AI security. Access is issued only to seated members, and only after a one-time code reaches the email on file.`}
    >
      <MemberAccess members={members} />
    </AccessGate>
  );
}
