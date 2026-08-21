import type { PulseQuestionSeed } from "@/lib/pulse-instrument";

export type PulseAnswerValue =
  | number
  | "YES"
  | "NO"
  | "VERY"
  | "SOMEWHAT"
  | "NOT"
  | string
  | string[]
  | { liked: string; disliked: string };

export type PulseAnswerState = {
  value: PulseAnswerValue | null;
  comment: string;
};

export function emptyAnswer(): PulseAnswerState {
  return { value: null, comment: "" };
}

export function hasValue(state: PulseAnswerState | undefined) {
  if (!state || state.value == null) {
    return false;
  }

  if (typeof state.value === "string") {
    return state.value.trim().length > 0;
  }

  if (Array.isArray(state.value)) {
    return state.value.length > 0;
  }

  if (typeof state.value === "object") {
    const liked = "liked" in state.value ? String(state.value.liked ?? "") : "";
    const disliked =
      "disliked" in state.value ? String(state.value.disliked ?? "") : "";
    return liked.trim().length > 0 || disliked.trim().length > 0;
  }

  return true;
}

export function isQuestionComplete(
  question: PulseQuestionSeed,
  state: PulseAnswerState | undefined,
) {
  if (!question.required) {
    return true;
  }
  if (
    question.type === "MULTI" &&
    question.maxSelect &&
    Array.isArray(state?.value)
  ) {
    return state.value.length === question.maxSelect;
  }
  return hasValue(state);
}

export function likertLabel(value: PulseAnswerValue | null | undefined) {
  if (typeof value !== "number" || value < 1 || value > 5) {
    return "Not answered";
  }
  const labels = [
    "Strongly disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly agree",
  ];
  return `${labels[value - 1]} (${value}/5)`;
}

export function pmfLabel(value: PulseAnswerValue | null | undefined) {
  if (value === "VERY") {
    return "Very disappointed";
  }
  if (value === "SOMEWHAT") {
    return "Somewhat disappointed";
  }
  if (value === "NOT") {
    return "Not disappointed";
  }
  return "Not answered";
}

export function sectionProgress(
  questions: PulseQuestionSeed[],
  answers: Record<string, PulseAnswerState>,
) {
  const required = questions.filter((question) => question.required);
  const tracked = required.length > 0 ? required : questions;
  const answered = tracked.filter((question) =>
    question.required
      ? isQuestionComplete(question, answers[question.id])
      : hasValue(answers[question.id]),
  ).length;

  if (tracked.length === 0 || answered === 0) {
    return "pending" as const;
  }
  if (answered >= tracked.length) {
    return "complete" as const;
  }
  return "in_progress" as const;
}
