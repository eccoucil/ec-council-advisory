import { PulseSurvey } from "@/components/pulse-survey";
import {
  sectionProgress,
  type PulseAnswerState,
  type PulseAnswerValue,
} from "@/lib/pulse-answers";
import { pulseSections, questionsForSection } from "@/lib/pulse-instrument";
import { prisma } from "@/lib/prisma";
import { isPulseWindowOpen } from "@/lib/pulse-window";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Board Pulse · Survey",
};

function firstOpenSection(answers: Record<string, PulseAnswerState>) {
  for (const section of pulseSections) {
    if (sectionProgress(questionsForSection(section.id), answers) !== "complete") {
      return section.id;
    }
  }
  return 6;
}

export default async function BoardSurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }
  if (session.role !== "MEMBER") {
    redirect("/admin");
  }

  if (!(await isPulseWindowOpen())) {
    redirect("/board");
  }

  const [{ s }, rows] = await Promise.all([
    searchParams,
    prisma.pulseAnswer.findMany({
      where: { memberId: session.memberId },
      select: { questionId: true, valueJson: true, commentText: true },
    }),
  ]);

  const initialAnswers: Record<string, PulseAnswerState> = {};
  for (const row of rows) {
    initialAnswers[row.questionId] = {
      value: row.valueJson as PulseAnswerValue,
      comment: row.commentText ?? "",
    };
  }

  const requested = Number(s);
  const initialSection =
    Number.isInteger(requested) && requested >= 0 && requested <= 6
      ? requested
      : firstOpenSection(initialAnswers);

  return (
    <PulseSurvey
      name={session.name}
      initialSection={initialSection}
      initialAnswers={initialAnswers}
    />
  );
}
