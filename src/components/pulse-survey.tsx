"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { savePulseAnswer, submitPulse } from "@/app/actions/pulse";
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCloudCheck,
  IconDashed,
  IconPen,
  IconPlus,
  IconShield,
  IconThumbsDown,
  IconThumbsUp,
} from "@/components/pulse-icons";
import {
  emptyAnswer,
  hasValue,
  sectionProgress,
  type PulseAnswerState,
  type PulseAnswerValue,
} from "@/lib/pulse-answers";
import {
  LIKERT_LABELS,
  pulseQuestions,
  pulseSections,
  questionKindLabel,
  questionsForSection,
  type PulseQuestionSeed,
  type PulseSectionMeta,
} from "@/lib/pulse-instrument";
import { memberInitials, memberShortName } from "@/lib/member-display";

type SaveStatus = "saved" | "saving" | "error";

const GUARDRAIL =
  "Please share general, industry-level pain points only. Do not include confidential information, internal project details, or anything covered by your employer's obligations.";

function kindForProgress(
  meta: PulseSectionMeta,
  answers: Record<string, PulseAnswerState>,
  currentId: number,
) {
  if (meta.id === currentId) {
    return "current" as const;
  }
  return sectionProgress(questionsForSection(meta.id), answers);
}

function minutesLeft(currentId: number, answers: Record<string, PulseAnswerState>) {
  const remaining = pulseQuestions.filter((question) => {
    if (question.section < currentId) {
      return false;
    }
    if (!question.required) {
      return false;
    }
    return !hasValue(answers[question.id]);
  }).length;
  return Math.max(1, Math.round(remaining * 0.35));
}

function questionLabel(meta: PulseSectionMeta, kind: "complete" | "in_progress" | "pending" | "current") {
  if (kind === "current") {
    return `${meta.questionLabel.replace(" · optional", "").replace(" · required", "")} · in progress`;
  }
  if (kind === "complete" && meta.optional) {
    return meta.questionLabel;
  }
  return meta.questionLabel;
}

export function PulseSurvey({
  name,
  initialSection,
  initialAnswers,
}: {
  name: string;
  initialSection: number;
  initialAnswers: Record<string, PulseAnswerState>;
}) {
  const router = useRouter();
  const [sectionId, setSectionId] = useState(initialSection);
  const [answers, setAnswers] = useState(initialAnswers);
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timers = useRef(new Map<string, number>());
  const pending = useRef(
    new Map<string, { value: PulseAnswerValue; comment?: string }>(),
  );

  const section = pulseSections[sectionId] ?? pulseSections[1];
  const questions = questionsForSection(section.id);
  const prev = pulseSections[section.id - 1];
  const next = pulseSections[section.id + 1];

  const persist = useCallback(
    async (questionId: string, value: PulseAnswerValue, comment?: string) => {
      setStatus("saving");
      const result = await savePulseAnswer(questionId, value, comment);
      setStatus(result.ok ? "saved" : "error");
    },
    [],
  );

  const schedule = useCallback(
    (questionId: string, value: PulseAnswerValue, comment?: string) => {
      const existing = timers.current.get(questionId);
      if (existing) {
        window.clearTimeout(existing);
      }
      const handle = window.setTimeout(() => {
        pending.current.delete(questionId);
        void persist(questionId, value, comment);
      }, 400);
      pending.current.set(questionId, { value, comment });
      timers.current.set(questionId, handle);
    },
    [persist],
  );

  useEffect(() => {
    return () => {
      for (const handle of timers.current.values()) {
        window.clearTimeout(handle);
      }
    };
  }, []);

  const goTo = (id: number) => {
    setSectionId(id);
    router.replace(`/board/survey?s=${id}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const patch = (
    question: PulseQuestionSeed,
    nextState: PulseAnswerState,
    immediate = false,
  ) => {
    if (nextState.value == null) {
      return;
    }
    setAnswers((current) => ({ ...current, [question.id]: nextState }));
    if (immediate) {
      void persist(question.id, nextState.value, nextState.comment);
    } else {
      schedule(question.id, nextState.value, nextState.comment);
    }
  };

  const finish = async () => {
    if (submitting) {
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    for (const handle of timers.current.values()) {
      window.clearTimeout(handle);
    }
    timers.current.clear();
    const queued = [...pending.current.entries()];
    pending.current.clear();
    await Promise.all(
      queued.map(([questionId, payload]) =>
        persist(questionId, payload.value, payload.comment),
      ),
    );
    const result = await submitPulse();
    if (result.ok) {
      router.push("/board");
      router.refresh();
      return;
    }
    setSubmitError(result.error);
    setSubmitting(false);
    if (result.section != null) {
      goTo(result.section);
    }
  };

  const scoredPosition = section.id === 0 ? null : section.id;

  return (
    <div className="pulse-survey">
      <header className="pulse-survey-topbar">
        <div className="pulse-brand">
          <span className="pulse-mark">EC-Council</span>
          <span className="pulse-sep" aria-hidden />
          <span className="pulse-product">Board Pulse</span>
        </div>
        <p className="pulse-survey-position">
          {scoredPosition ? (
            <>
              <span>Section {scoredPosition} of 6</span>
              <span aria-hidden>·</span>
              <span>about {minutesLeft(section.id, answers)} minutes left</span>
            </>
          ) : (
            <>
              <span>Pre-read</span>
              <span aria-hidden>·</span>
              <span>optional</span>
            </>
          )}
        </p>
        <div className="pulse-survey-tools">
          <p
            className={`pulse-survey-saved${status === "error" ? " is-error" : ""}`}
          >
            <IconCloudCheck />
            {status === "saving"
              ? "Saving…"
              : status === "error"
                ? "Couldn’t save — retry the last answer"
                : "All answers saved"}
          </p>
          <Link className="pulse-survey-exit" href="/board">
            Save & exit
          </Link>
          <div className="pulse-user">
            <span className="pulse-avatar" aria-hidden>
              {memberInitials(name)}
            </span>
            <span className="pulse-user-name">{memberShortName(name)}</span>
          </div>
        </div>
      </header>

      <div className="pulse-progress" aria-hidden>
        {pulseSections.map((item) => {
          const kind = kindForProgress(item, answers, section.id);
          return (
            <span
              key={item.id}
              className={`pulse-progress-seg is-${kind === "current" ? "current" : kind === "complete" ? "done" : "todo"}`}
            />
          );
        })}
      </div>

      <div className="pulse-survey-body">
        <aside className="pulse-rail">
          <p className="pulse-rail-label">Sections</p>
          <nav className="pulse-rail-list" aria-label="Survey sections">
            {pulseSections.map((item) => {
              const kind = kindForProgress(item, answers, section.id);
              return (
                <button
                  key={item.id}
                  className={`pulse-rail-item is-${item.tone} is-${kind}`}
                  type="button"
                  onClick={() => goTo(item.id)}
                >
                  <span className="pulse-rail-item-body">
                    <span className="pulse-rail-head">
                      <span className="pulse-rail-num">{item.id}</span>
                      <span className="pulse-rail-title">{item.railTitle}</span>
                      {kind === "complete" ? (
                        <IconCheck />
                      ) : kind === "current" ? (
                        <IconPen />
                      ) : (
                        <IconDashed />
                      )}
                    </span>
                    <span className="pulse-rail-meta">
                      {questionLabel(item, kind)}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="pulse-rail-guard">
            <div className="pulse-rail-guard-body">
              <p>
                <IconShield />
                No IP, please
              </p>
              <span>
                General, industry-level pain points only — nothing confidential
                or employer-restricted.
              </span>
            </div>
          </div>
        </aside>

        <main className="pulse-main">
          <div className="pulse-column">
            <header className="pulse-section-head">
              <p className={`pulse-section-eyebrow is-${section.tone}`}>
                {section.eyebrow}
              </p>
              <h1>{section.title}</h1>
              <p className="pulse-section-desc">{section.description}</p>
              {section.anchors ? (
                <div className="pulse-anchors">
                  <span>Anchored to</span>
                  {section.anchors.map((anchor) => (
                    <span
                      key={`${anchor.code}-${anchor.label}`}
                      className="pulse-anchor"
                    >
                      <em>{anchor.code}</em>
                      {anchor.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>

            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                tone={section.tone}
                answer={answers[question.id] ?? emptyAnswer()}
                onChange={patch}
              />
            ))}

            <div className="pulse-section-nav">
              {prev ? (
                <button
                  className="pulse-nav-back"
                  type="button"
                  onClick={() => goTo(prev.id)}
                >
                  <IconArrowLeft />
                  Back · {prev.railTitle}
                </button>
              ) : (
                <Link className="pulse-nav-back" href="/board">
                  <IconArrowLeft />
                  Back · Portal
                </Link>
              )}
              <div className="pulse-nav-right">
                {next && !section.requiredSection ? (
                  <button
                    className="pulse-nav-skip"
                    type="button"
                    onClick={() => goTo(next.id)}
                  >
                    Skip this section
                  </button>
                ) : null}
                {next ? (
                  <button
                    className="pulse-nav-next"
                    type="button"
                    onClick={() => goTo(next.id)}
                  >
                    Next · {next.railTitle}
                    <IconArrowRight />
                  </button>
                ) : (
                  <button
                    className="pulse-nav-next"
                    type="button"
                    disabled={submitting}
                    onClick={() => void finish()}
                  >
                    {submitting ? "Submitting…" : "Submit responses"}
                    <IconArrowRight />
                  </button>
                )}
              </div>
            </div>
            {submitError ? (
              <p className="pulse-submit-error">{submitError}</p>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  tone,
  answer,
  onChange,
}: {
  question: PulseQuestionSeed;
  tone: PulseSectionMeta["tone"];
  answer: PulseAnswerState;
  onChange: (
    question: PulseQuestionSeed,
    next: PulseAnswerState,
    immediate?: boolean,
  ) => void;
}) {
  return (
    <section className={`pulse-q is-${tone}`}>
      <div className="pulse-q-body">
        <div className="pulse-q-head">
          <span className="pulse-q-code">{question.code}</span>
          <div>
            <h2>{question.prompt}</h2>
            <p>{questionKindLabel(question)}</p>
          </div>
        </div>
        {question.type === "LIKERT" ? (
          <Likert
            value={typeof answer.value === "number" ? answer.value : null}
            onPick={(value) => onChange(question, { value, comment: "" }, true)}
          />
        ) : null}
        {question.type === "YESNO" ? (
          <YesNo
            value={answer.value === "YES" || answer.value === "NO" ? answer.value : null}
            comment={answer.comment}
            onPick={(value) =>
              onChange(question, { value, comment: answer.comment }, true)
            }
            onComment={(comment) => {
              if (answer.value === "YES" || answer.value === "NO") {
                onChange(question, { value: answer.value, comment });
              }
            }}
          />
        ) : null}
        {question.type === "PMF" ? (
          <ChoiceList
            options={question.options ?? []}
            value={typeof answer.value === "string" ? answer.value : null}
            onPick={(value) => onChange(question, { value, comment: "" }, true)}
          />
        ) : null}
        {question.type === "MULTI" ? (
          <Chips
            options={question.options ?? []}
            selected={Array.isArray(answer.value) ? answer.value : []}
            maxSelect={question.maxSelect}
            onChange={(values) =>
              onChange(question, { value: values, comment: "" }, true)
            }
          />
        ) : null}
        {question.type === "TEXT" ? (
          <>
            <Guardrail />
            <label className="pulse-text">
              <textarea
                value={typeof answer.value === "string" ? answer.value : ""}
                placeholder="Type your answer…"
                rows={4}
                onChange={(event) =>
                  onChange(question, { value: event.target.value, comment: "" })
                }
              />
            </label>
          </>
        ) : null}
        {question.type === "DUAL_TEXT" ? (
          <DualText
            liked={
              answer.value &&
              typeof answer.value === "object" &&
              !Array.isArray(answer.value)
                ? answer.value.liked
                : ""
            }
            disliked={
              answer.value &&
              typeof answer.value === "object" &&
              !Array.isArray(answer.value)
                ? answer.value.disliked
                : ""
            }
            onChange={(liked, disliked) =>
              onChange(question, { value: { liked, disliked }, comment: "" })
            }
          />
        ) : null}
      </div>
    </section>
  );
}

function Likert({
  value,
  onPick,
}: {
  value: number | null;
  onPick: (value: number) => void;
}) {
  return (
    <div className="pulse-scale" role="radiogroup" aria-label="Likert scale">
      {LIKERT_LABELS.map((label, index) => {
        const n = index + 1;
        const selected = value === n;
        return (
          <button
            key={n}
            className={`pulse-scale-point${selected ? " is-on" : ""}`}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onPick(n)}
          >
            <strong>{n}</strong>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function YesNo({
  value,
  comment,
  onPick,
  onComment,
}: {
  value: "YES" | "NO" | null;
  comment: string;
  onPick: (value: "YES" | "NO") => void;
  onComment: (comment: string) => void;
}) {
  return (
    <>
      <div className="pulse-yesno">
        {(
          [
            ["YES", "Yes"],
            ["NO", "No"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            className={`pulse-choice is-compact${value === id ? " is-on" : ""}`}
            type="button"
            onClick={() => onPick(id)}
          >
            {label}
            <span className="pulse-mark" aria-hidden />
          </button>
        ))}
      </div>
      {value ? (
        <label className="pulse-comment">
          <textarea
            value={comment}
            placeholder="Optional comment — general, non-IP only"
            rows={3}
            onChange={(event) => onComment(event.target.value)}
          />
          <span>Optional comment · general, non-IP only</span>
        </label>
      ) : (
        <p className="pulse-unanswered">
          Not answered yet — autosaves the moment you choose.
        </p>
      )}
    </>
  );
}

function ChoiceList({
  options,
  value,
  onPick,
}: {
  options: Array<{ id: string; label: string }>;
  value: string | null;
  onPick: (value: string) => void;
}) {
  return (
    <div className="pulse-choices">
      {options.map((option) => (
        <button
          key={option.id}
          className={`pulse-choice${value === option.id ? " is-on" : ""}`}
          type="button"
          onClick={() => onPick(option.id)}
        >
          {option.label}
          <span className="pulse-mark" aria-hidden />
        </button>
      ))}
    </div>
  );
}

function Chips({
  options,
  selected,
  maxSelect,
  onChange,
}: {
  options: Array<{ id: string; label: string }>;
  selected: string[];
  maxSelect?: number;
  onChange: (values: string[]) => void;
}) {
  const toggle = (id: string) => {
    const on = selected.includes(id);
    if (id === "nothing") {
      onChange(on ? [] : ["nothing"]);
      return;
    }
    const withoutNothing = selected.filter((item) => item !== "nothing");
    if (on) {
      onChange(withoutNothing.filter((item) => item !== id));
      return;
    }
    if (maxSelect && withoutNothing.length >= maxSelect) {
      return;
    }
    onChange([...withoutNothing, id]);
  };

  return (
    <div className="pulse-chips">
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            className={`pulse-chip${on ? " is-on" : ""}`}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(option.id)}
          >
            {on ? <IconCheck /> : <IconPlus />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Guardrail() {
  return (
    <p className="pulse-guard">
      <IconShield />
      {GUARDRAIL}
    </p>
  );
}

function DualText({
  liked,
  disliked,
  onChange,
}: {
  liked: string;
  disliked: string;
  onChange: (liked: string, disliked: string) => void;
}) {
  return (
    <>
      <Guardrail />
      <div className="pulse-dual">
        <label className="pulse-dual-field is-liked">
          <span>
            <IconThumbsUp />
            Liked
          </span>
          <textarea
            value={liked}
            placeholder="Type your answer…"
            rows={5}
            onChange={(event) => onChange(event.target.value, disliked)}
          />
        </label>
        <label className="pulse-dual-field is-disliked">
          <span>
            <IconThumbsDown />
            Disliked
          </span>
          <textarea
            value={disliked}
            placeholder="Type your answer…"
            rows={5}
            onChange={(event) => onChange(liked, event.target.value)}
          />
        </label>
      </div>
    </>
  );
}
