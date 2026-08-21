import { describe, expect, it } from "vitest";
import {
  emptyAnswer,
  hasValue,
  isQuestionComplete,
  likertLabel,
  pmfLabel,
  sectionProgress,
  type PulseAnswerState,
} from "@/lib/pulse-answers";
import type { PulseQuestionSeed } from "@/lib/pulse-instrument";

function question(overrides: Partial<PulseQuestionSeed> = {}): PulseQuestionSeed {
  return {
    id: "q-1",
    section: 1,
    code: "1.1",
    sortOrder: 1,
    type: "LIKERT",
    prompt: "Placeholder prompt.",
    required: true,
    ...overrides,
  };
}

function answer(value: PulseAnswerState["value"]): PulseAnswerState {
  return { value, comment: "" };
}

describe("emptyAnswer", () => {
  it("starts unanswered with no comment", () => {
    expect(emptyAnswer()).toEqual({ value: null, comment: "" });
  });
});

describe("hasValue", () => {
  it("is false when the state is missing or null", () => {
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue(emptyAnswer())).toBe(false);
  });

  it("counts a Likert score, including the lowest one", () => {
    expect(hasValue(answer(1))).toBe(true);
    expect(hasValue(answer(5))).toBe(true);
  });

  it("counts zero as answered", () => {
    expect(hasValue(answer(0))).toBe(true);
  });

  it("ignores whitespace-only free text", () => {
    expect(hasValue(answer("   "))).toBe(false);
    expect(hasValue(answer("a real answer"))).toBe(true);
  });

  it("requires at least one selection for multi-select", () => {
    expect(hasValue(answer([]))).toBe(false);
    expect(hasValue(answer(["pricing"]))).toBe(true);
  });

  it("accepts a liked/disliked pair when either side is filled", () => {
    expect(hasValue(answer({ liked: "", disliked: "" }))).toBe(false);
    expect(hasValue(answer({ liked: "  ", disliked: "the pricing" }))).toBe(true);
    expect(hasValue(answer({ liked: "the demo", disliked: "" }))).toBe(true);
  });
});

describe("isQuestionComplete", () => {
  it("treats optional questions as complete even when blank", () => {
    expect(isQuestionComplete(question({ required: false }), undefined)).toBe(true);
  });

  it("requires a value for a required question", () => {
    expect(isQuestionComplete(question(), undefined)).toBe(false);
    expect(isQuestionComplete(question(), answer(4))).toBe(true);
  });

  it("requires exactly maxSelect choices on a capped multi-select", () => {
    const multi = question({ type: "MULTI", maxSelect: 3 });
    expect(isQuestionComplete(multi, answer(["a"]))).toBe(false);
    expect(isQuestionComplete(multi, answer(["a", "b"]))).toBe(false);
    expect(isQuestionComplete(multi, answer(["a", "b", "c"]))).toBe(true);
  });

  it("falls back to presence for an uncapped multi-select", () => {
    const multi = question({ type: "MULTI" });
    expect(isQuestionComplete(multi, answer(["a"]))).toBe(true);
    expect(isQuestionComplete(multi, answer([]))).toBe(false);
  });
});

describe("likertLabel", () => {
  it.each([
    [1, "Strongly disagree (1/5)"],
    [3, "Neutral (3/5)"],
    [5, "Strongly agree (5/5)"],
  ])("labels %i", (value, expected) => {
    expect(likertLabel(value)).toBe(expected);
  });

  it.each([null, undefined, 0, 6, "YES"] as const)("rejects out-of-range %s", (value) => {
    expect(likertLabel(value)).toBe("Not answered");
  });
});

describe("pmfLabel", () => {
  it.each([
    ["VERY", "Very disappointed"],
    ["SOMEWHAT", "Somewhat disappointed"],
    ["NOT", "Not disappointed"],
  ] as const)("labels %s", (value, expected) => {
    expect(pmfLabel(value)).toBe(expected);
  });

  it("falls back for anything else", () => {
    expect(pmfLabel(null)).toBe("Not answered");
    expect(pmfLabel("MAYBE")).toBe("Not answered");
  });
});

describe("sectionProgress", () => {
  const required = [
    question({ id: "a", code: "1.1" }),
    question({ id: "b", code: "1.2" }),
  ];

  it("is pending when nothing is answered", () => {
    expect(sectionProgress(required, {})).toBe("pending");
  });

  it("is in_progress when some required questions remain", () => {
    expect(sectionProgress(required, { a: answer(4) })).toBe("in_progress");
  });

  it("is complete when every required question is answered", () => {
    expect(sectionProgress(required, { a: answer(4), b: answer(2) })).toBe("complete");
  });

  it("is pending for a section with no questions at all", () => {
    expect(sectionProgress([], {})).toBe("pending");
  });

  it("tracks optional questions when the section has no required ones", () => {
    const optional = [
      question({ id: "x", required: false }),
      question({ id: "y", required: false }),
    ];
    expect(sectionProgress(optional, {})).toBe("pending");
    expect(sectionProgress(optional, { x: answer("note") })).toBe("in_progress");
    expect(sectionProgress(optional, { x: answer("note"), y: answer("note") })).toBe("complete");
  });

  it("ignores an unanswered optional question in a required section", () => {
    const mixed = [question({ id: "a" }), question({ id: "z", required: false })];
    expect(sectionProgress(mixed, { a: answer(4) })).toBe("complete");
  });
});
