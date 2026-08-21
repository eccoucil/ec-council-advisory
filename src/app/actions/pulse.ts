"use server";

import { Prisma, PulseQuestionType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  isQuestionComplete,
  type PulseAnswerState,
  type PulseAnswerValue,
} from "@/lib/pulse-answers";
import { pulseQuestions } from "@/lib/pulse-instrument";
import { isPulseWindowOpen } from "@/lib/pulse-window";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

const TEXT_MAX = 4000;
const COMMENT_MAX = 2000;

type SaveResult =
  | { ok: true }
  | { ok: false; error: string };

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function trimText(value: unknown, max: number) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    return null;
  }
  return trimmed;
}

function normalizeValue(
  type: PulseQuestionType,
  allowedIds: Set<string>,
  maxSelect: number | null,
  value: unknown,
): Prisma.InputJsonValue | null {
  switch (type) {
    case PulseQuestionType.LIKERT: {
      const n = typeof value === "number" ? value : Number(value);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return null;
      }
      return n;
    }
    case PulseQuestionType.YESNO: {
      if (value !== "YES" && value !== "NO") {
        return null;
      }
      return value;
    }
    case PulseQuestionType.PMF: {
      if (value !== "VERY" && value !== "SOMEWHAT" && value !== "NOT") {
        return null;
      }
      return value;
    }
    case PulseQuestionType.MULTI: {
      if (!Array.isArray(value) || !value.every((id) => typeof id === "string")) {
        return null;
      }
      const unique = [...new Set(value)];
      if (unique.some((id) => !allowedIds.has(id))) {
        return null;
      }
      if (unique.includes("nothing") && unique.length > 1) {
        return ["nothing"];
      }
      if (maxSelect && unique.length > maxSelect) {
        return null;
      }
      return unique;
    }
    case PulseQuestionType.TEXT: {
      const text = trimText(value, TEXT_MAX);
      if (text == null) {
        return null;
      }
      return text;
    }
    case PulseQuestionType.DUAL_TEXT: {
      const obj = asObject(value);
      if (!obj) {
        return null;
      }
      const liked = trimText(obj.liked ?? "", TEXT_MAX);
      const disliked = trimText(obj.disliked ?? "", TEXT_MAX);
      if (liked == null || disliked == null) {
        return null;
      }
      return { liked, disliked };
    }
  }
}

export async function savePulseAnswer(
  questionId: string,
  value: unknown,
  comment?: string | null,
): Promise<SaveResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }

  if (!(await isPulseWindowOpen())) {
    return { ok: false, error: "The window has closed. Your responses are locked." };
  }

  const question = await prisma.pulseQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question) {
    return { ok: false, error: "That question could not be found." };
  }

  const instrument = pulseQuestions.find((item) => item.id === questionId);
  const allowedIds = new Set(
    (instrument?.options ?? []).map((option) => option.id),
  );

  const valueJson = normalizeValue(
    question.type,
    allowedIds,
    question.maxSelect,
    value,
  );

  if (valueJson == null) {
    return { ok: false, error: "That answer could not be saved." };
  }

  let commentText: string | null = null;
  if (question.type === PulseQuestionType.YESNO) {
    if (comment != null && comment !== "") {
      const trimmed = trimText(comment, COMMENT_MAX);
      if (trimmed == null) {
        return { ok: false, error: "That comment is too long." };
      }
      commentText = trimmed || null;
    }
  }

  await prisma.pulseAnswer.upsert({
    where: {
      memberId_questionId: {
        memberId: session.memberId,
        questionId,
      },
    },
    create: {
      memberId: session.memberId,
      questionId,
      valueJson,
      commentText,
    },
    update: {
      valueJson,
      ...(question.type === PulseQuestionType.YESNO
        ? { commentText }
        : {}),
    },
  });

  if (questionId === "s6-5") {
    revalidatePath("/board");
  }

  return { ok: true };
}

export async function submitPulse(): Promise<
  | { ok: true }
  | { ok: false; error: string; section?: number }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "You must be signed in." };
  }

  if (!(await isPulseWindowOpen())) {
    return { ok: false, error: "The window has closed. Your responses are locked." };
  }

  const rows = await prisma.pulseAnswer.findMany({
    where: { memberId: session.memberId },
    select: { questionId: true, valueJson: true, commentText: true },
  });

  const answers: Record<string, PulseAnswerState> = {};
  for (const row of rows) {
    answers[row.questionId] = {
      value: row.valueJson as PulseAnswerValue,
      comment: row.commentText ?? "",
    };
  }

  const incomplete = pulseQuestions.find(
    (question) =>
      question.required && !isQuestionComplete(question, answers[question.id]),
  );

  if (incomplete) {
    return {
      ok: false,
      error: `Answer ${incomplete.code} before submitting.`,
      section: incomplete.section,
    };
  }

  const existing = await prisma.pulseSubmission.findUnique({
    where: { memberId: session.memberId },
    select: { id: true },
  });

  if (!existing) {
    await prisma.pulseSubmission.create({
      data: { memberId: session.memberId },
    });
  }

  revalidatePath("/board");
  return { ok: true };
}
