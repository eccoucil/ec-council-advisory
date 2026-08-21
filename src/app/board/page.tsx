import { PulseSubmitted } from "@/components/pulse-submitted";
import { PulseTopbar } from "@/components/pulse-topbar";
import {
  hasValue,
  likertLabel,
  pmfLabel,
  type PulseAnswerState,
  type PulseAnswerValue,
} from "@/lib/pulse-answers";
import { scoredQuestions } from "@/lib/pulse-instrument";
import { prisma } from "@/lib/prisma";
import {
  formatMytStamp,
  ordinal,
  PULSE_ROSTER_SIZE,
  isPulseWindowOpen,
} from "@/lib/pulse-window";
import { getSession } from "@/lib/session";
import Link from "next/link";
import { redirect } from "next/navigation";

const agenda = [
  {
    num: "01",
    title: "ADG V1 → ADG V2 Scale Up",
    desc: "12 minimum controls → 12 control families",
    tone: "crimson",
  },
  {
    num: "02",
    title: "ComplyX",
    desc: "AI compliance walkthrough",
    tone: "blue",
  },
  {
    num: "03",
    title: "AwareX",
    desc: "End-user awareness & simulation",
    tone: "gold",
  },
  {
    num: "04",
    title: "AI SOC",
    desc: "AI-based security operations",
    tone: "teal",
  },
  {
    num: "05",
    title: "Shadow AI",
    desc: "Endpoint discovery of AI usage",
    tone: "violet",
  },
] as const;

export default async function BoardLandingPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const [submission, answerRows, windowOpen] = await Promise.all([
    prisma.pulseSubmission.findUnique({
      where: { memberId: session.memberId },
    }),
    prisma.pulseAnswer.findMany({
      where: { memberId: session.memberId },
      select: { questionId: true, valueJson: true, commentText: true },
    }),
    isPulseWindowOpen(),
  ]);

  if (submission) {
    const answers: Record<string, PulseAnswerState> = {};
    for (const row of answerRows) {
      answers[row.questionId] = {
        value: row.valueJson as PulseAnswerValue,
        comment: row.commentText ?? "",
      };
    }

    const earlier = await prisma.pulseSubmission.count({
      where: { submittedAt: { lte: submission.submittedAt } },
    });

    const scoredAnswered = scoredQuestions.filter((question) =>
      hasValue(answers[question.id]),
    ).length;

    return (
      <PulseSubmitted
        name={session.name}
        submittedLabel={formatMytStamp(submission.submittedAt)}
        rankLabel={ordinal(earlier)}
        scoredAnswered={scoredAnswered}
        scoredTotal={scoredQuestions.length}
        rosterSize={PULSE_ROSTER_SIZE}
        glance={[
          {
            num: "01",
            title: "ADG V1 → ADG V2 Scale Up",
            tone: "crimson",
            likert: likertLabel(answers["s1-1"]?.value),
            signal:
              answers["s6-2"]?.value === "YES"
                ? "Approve"
                : answers["s6-2"]?.value === "NO"
                  ? "Do not approve"
                  : "—",
          },
          {
            num: "02",
            title: "ComplyX",
            tone: "blue",
            likert: likertLabel(answers["s2-1"]?.value),
            signal: pmfLabel(answers["s2-3"]?.value),
          },
          {
            num: "03",
            title: "AwareX",
            tone: "gold",
            likert: likertLabel(answers["s3-1"]?.value),
            signal: pmfLabel(answers["s3-3"]?.value),
          },
          {
            num: "04",
            title: "AI SOC",
            tone: "mint",
            likert: likertLabel(answers["s4-1"]?.value),
            signal: pmfLabel(answers["s4-3"]?.value),
          },
          {
            num: "05",
            title: "Shadow AI",
            tone: "violet",
            likert: likertLabel(answers["s5-1"]?.value),
            signal: pmfLabel(answers["s5-3"]?.value),
          },
        ]}
        windowOpen={windowOpen}
      />
    );
  }

  return (
    <div className="pulse-page">
      <PulseTopbar name={session.name} />

      <section className="pulse-hero">
        <div className="pulse-hero-copy">
          <p className="pulse-eyebrow">
            AI Advisory Board · Session of 27 August 2026
          </p>
          <h1>Turn the session into signal.</h1>
          <p className="pulse-lede">
            Your scores decide which solutions we accelerate, which claims we
            fix, and whether there is credible product-market fit to scale
            marketing. Thirty-eight practitioners, one instrument, five days.
          </p>

          <div className="pulse-metrics">
            <article className="pulse-metric is-teal">
              <div className="pulse-metric-body">
                <p>Estimated time</p>
                <strong>~12 min</strong>
                <span>6 sections, autosaved</span>
              </div>
            </article>
            <article className="pulse-metric is-ink">
              <div className="pulse-metric-body">
                <p>Questions</p>
                <strong>31</strong>
                <span>scored + optional text</span>
              </div>
            </article>
            <article className="pulse-metric is-ink">
              <div className="pulse-metric-body">
                <p>Agenda items</p>
                <strong>5</strong>
                <span>framework + 4 products</span>
              </div>
            </article>
            <article className="pulse-metric is-crimson">
              <div className="pulse-metric-body">
                <p>Window closes</p>
                <strong>1 Sep</strong>
                <span>23:59 MYT · editable until</span>
              </div>
            </article>
          </div>

          <div className="pulse-cta">
            <Link className="pulse-begin" href="/board/survey">
              Begin survey
              <svg viewBox="0 0 16 16" aria-hidden>
                <path
                  d="M3 8h9M8.5 4.5 12.5 8 8.5 11.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <p>Autosaves as you go — leave and resume from the same link.</p>
          </div>
        </div>

        <aside className="pulse-agenda">
          <p className="pulse-agenda-label">What you will score</p>
          {agenda.map((item) => (
            <article
              key={item.num}
              className={`pulse-agenda-item is-${item.tone}`}
            >
              <div className="pulse-agenda-body">
                <div className="pulse-agenda-head">
                  <span>{item.num}</span>
                  <h2>{item.title}</h2>
                </div>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </aside>
      </section>

      <section className="pulse-trust">
        <div className="pulse-trust-rule" />
        <h2>Before you begin</h2>
        <div className="pulse-trust-grid">
          <article className="pulse-trust-card is-crimson">
            <div className="pulse-trust-body">
              <div className="pulse-trust-head">
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M8 1.4 2.8 3.6v4.2c0 3.2 2.2 5.5 5.2 6.5 3-.9 5.2-3.3 5.2-6.5V3.6L8 1.4Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M8 5.2v3.1M8 10.4h.01"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <h3>No IP, please</h3>
              </div>
              <p>
                Share general, industry-level pain points only. Do not include
                confidential information, internal project details, or anything
                covered by your employer&apos;s obligations.
              </p>
            </div>
          </article>
          <article className="pulse-trust-card is-blue">
            <div className="pulse-trust-body">
              <div className="pulse-trust-head">
                <svg viewBox="0 0 16 16" aria-hidden>
                  <circle
                    cx="8"
                    cy="5.2"
                    r="2.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M3.4 13.2c.5-2.4 2.3-3.7 4.6-3.7s4.1 1.3 4.6 3.7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <h3>Attributed internally</h3>
              </div>
              <p>
                Your responses are attributed to you inside EC-Council so we
                can follow up. Anything that leaves EC-Council is aggregated
                and anonymised.
              </p>
            </div>
          </article>
          <article className="pulse-trust-card is-teal">
            <div className="pulse-trust-body">
              <div className="pulse-trust-head">
                <svg viewBox="0 0 16 16" aria-hidden>
                  <rect
                    x="3"
                    y="7.2"
                    width="10"
                    height="6.4"
                    rx="1.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M5.2 7.2V5.4a2.8 2.8 0 0 1 5.6 0v1.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                <h3>Held to GDPR standard</h3>
              </div>
              <p>
                Raw responses retained 12 months, then aggregate-only. Erasure
                honoured on request. No third-party form processors, no
                trackers.
              </p>
            </div>
          </article>
        </div>
        <footer className="pulse-footer">
          <span>board.aigovernance.eccouncil.org · secure link, no password</span>
          <span>PRD-ADG-PULSE-001 · Board Pulse — 27 Aug 2026</span>
        </footer>
      </section>
    </div>
  );
}
