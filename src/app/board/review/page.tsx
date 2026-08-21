import { redirect } from "next/navigation";
import { Questionnaire } from "@/components/questionnaire";
import { PulseTopbar } from "@/components/pulse-topbar";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export default async function BoardReviewPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const questions = await prisma.reviewQuestion.findMany({
    orderBy: { id: "asc" },
    include: {
      answers: {
        where: { memberId: session.memberId },
        select: { vote: true, comments: true },
      },
    },
  });

  return (
    <div className="pulse-page">
      <PulseTopbar name={session.name} />
      <main className="board-shell board-shell-review pulse-review">
        <header className="board-header">
          <p className="eyebrow">ADG Protocol · Board Review v1.1</p>
          <h1>{session.name}</h1>
          <p className="lede">
            Answer each question Yes or No. Comments are optional once a vote
            is recorded. Your answers are stored against this board seat.
          </p>
        </header>

        <Questionnaire
          questions={questions.map(({ answers, ...question }) => ({
            ...question,
            vote: answers[0]?.vote ?? null,
            comments: answers[0]?.comments ?? "",
          }))}
        />
      </main>
    </div>
  );
}
