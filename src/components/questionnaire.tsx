"use client";

import { useMemo, useState, useTransition } from "react";
import { saveReviewComments, saveReviewVote } from "@/app/actions/review";

type ReviewVote = "YES" | "NO";

export type QuestionWithAnswer = {
  id: number;
  section: string;
  sectionTitle: string;
  polarity: string;
  isGate: boolean;
  isRevised: boolean;
  prompt: string;
  basis: string;
  vote: ReviewVote | null;
  comments: string;
};

export function Questionnaire({ questions }: { questions: QuestionWithAnswer[] }) {
  const sections = useMemo(() => {
    const groups: Array<{
      key: string;
      title: string;
      polarity: string;
      items: QuestionWithAnswer[];
    }> = [];

    for (const question of questions) {
      const current = groups[groups.length - 1];
      if (!current || current.key !== question.section) {
        groups.push({
          key: question.section,
          title: question.sectionTitle,
          polarity: question.polarity,
          items: [question],
        });
      } else {
        current.items.push(question);
      }
    }

    return groups;
  }, [questions]);

  const answered = questions.filter((question) => question.vote).length;

  return (
    <div className="review">
      <p className="status-line">
        {answered} of {questions.length} answered
      </p>
      {sections.map((section) => (
        <section key={section.key} className="review-section">
          <p className="kicker">Section {section.key}</p>
          <h2 className="panel-title">{section.title}</h2>
          <p className="lede">{section.polarity}</p>
          <ol className="review-list">
            {section.items.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: QuestionWithAnswer }) {
  const [vote, setVote] = useState<ReviewVote | null>(question.vote);
  const [comments, setComments] = useState(question.comments);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  function choose(next: ReviewVote) {
    setError(null);
    setVote(next);
    startSaving(async () => {
      const result = await saveReviewVote(question.id, next);
      if (!result.ok) {
        setVote(question.vote);
        setError(result.error);
      }
    });
  }

  function persistComments() {
    if (!vote) {
      return;
    }

    startSaving(async () => {
      const result = await saveReviewComments(question.id, comments);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <li className="review-card" id={`q-${question.id}`}>
      <div className="review-meta">
        <span>Q{question.id}</span>
        {question.isGate ? <span className="badge">Gate</span> : null}
        {question.isRevised ? <span className="badge badge-quiet">Rev</span> : null}
      </div>
      <p className="review-prompt">{question.prompt}</p>
      <p className="review-basis">Basis: {question.basis}</p>
      <p className="review-polarity">{question.polarity}</p>

      <div className="vote-row" role="group" aria-label={`Answer for question ${question.id}`}>
        <button
          className={vote === "YES" ? "vote-btn is-on" : "vote-btn"}
          type="button"
          disabled={isSaving}
          onClick={() => choose("YES")}
        >
          Yes
        </button>
        <button
          className={vote === "NO" ? "vote-btn is-on" : "vote-btn"}
          type="button"
          disabled={isSaving}
          onClick={() => choose("NO")}
        >
          No
        </button>
      </div>

      <label className="field-label" htmlFor={`comment-${question.id}`}>
        Comments
      </label>
      <textarea
        id={`comment-${question.id}`}
        className="comment-box"
        rows={3}
        value={comments}
        disabled={!vote || isSaving}
        placeholder={vote ? "Rationale, conditions, or dissent" : "Select Yes or No first"}
        onChange={(event) => setComments(event.target.value)}
        onBlur={persistComments}
      />

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </li>
  );
}
