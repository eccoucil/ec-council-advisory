"use server";

import { revalidatePath } from "next/cache";
import { ReviewVote } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function saveReviewVote(questionId: number, vote: ReviewVote) {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, error: "You must be signed in." };
  }

  if (!Number.isInteger(questionId) || questionId < 1 || questionId > 50) {
    return { ok: false as const, error: "That question could not be found." };
  }

  if (vote !== ReviewVote.YES && vote !== ReviewVote.NO) {
    return { ok: false as const, error: "Choose Yes or No." };
  }

  const question = await prisma.reviewQuestion.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!question) {
    return { ok: false as const, error: "That question could not be found." };
  }

  await prisma.reviewAnswer.upsert({
    where: {
      memberId_questionId: {
        memberId: session.memberId,
        questionId,
      },
    },
    create: {
      memberId: session.memberId,
      questionId,
      vote,
    },
    update: {
      vote,
    },
  });

  revalidatePath("/board");
  return { ok: true as const };
}

export async function saveReviewComments(questionId: number, comments: string) {
  const session = await getSession();
  if (!session) {
    return { ok: false as const, error: "You must be signed in." };
  }

  if (!Number.isInteger(questionId) || questionId < 1 || questionId > 50) {
    return { ok: false as const, error: "That question could not be found." };
  }

  const existing = await prisma.reviewAnswer.findUnique({
    where: {
      memberId_questionId: {
        memberId: session.memberId,
        questionId,
      },
    },
    select: { vote: true },
  });

  if (!existing) {
    return {
      ok: false as const,
      error: "Select Yes or No before adding a comment.",
    };
  }

  await prisma.reviewAnswer.update({
    where: {
      memberId_questionId: {
        memberId: session.memberId,
        questionId,
      },
    },
    data: {
      comments: comments.trim() || null,
    },
  });

  revalidatePath("/board");
  return { ok: true as const };
}
