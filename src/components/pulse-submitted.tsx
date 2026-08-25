import Link from "next/link";
import { memberInitials, memberShortName } from "@/lib/member-display";
import { EcCouncilLogo } from "@/components/ec-council-logo";

export type GlanceRow = {
  num: string;
  title: string;
  tone: "crimson" | "blue" | "gold" | "mint" | "violet";
  likert: string;
  signal: string;
};

export function PulseSubmitted({
  name,
  submittedLabel,
  rankLabel,
  scoredAnswered,
  scoredTotal,
  rosterSize,
  glance,
  windowOpen,
}: {
  name: string;
  submittedLabel: string;
  rankLabel: string;
  scoredAnswered: number;
  scoredTotal: number;
  rosterSize: number;
  glance: GlanceRow[];
  windowOpen: boolean;
}) {
  return (
    <div className="pulse-page">
      <header className="pulse-survey-topbar">
        <div className="pulse-brand">
          <EcCouncilLogo height={26} />
          <span className="pulse-sep" aria-hidden />
          <span className="pulse-product">Board Pulse</span>
        </div>
        <div className="pulse-survey-tools">
          <p className="pulse-survey-saved">
            <CheckIcon />
            Submitted {submittedLabel}
          </p>
          <div className="pulse-user">
            <span className="pulse-avatar" aria-hidden>
              {memberInitials(name)}
            </span>
            <span className="pulse-user-name">{memberShortName(name)}</span>
          </div>
        </div>
      </header>

      <div className="pulse-done">
        <div className="pulse-done-column">
          <header className="pulse-done-head">
            <p className="pulse-done-eyebrow">
              Response recorded · {scoredAnswered} of {scoredTotal} scored
              questions answered
            </p>
            <h1>Your responses are in.</h1>
            <p className="pulse-done-lede">
              You are the {rankLabel} of {rosterSize} members to submit. The
              board readout goes to leadership within seven days of the window
              closing.
            </p>
          </header>

          <section className="pulse-glance">
            <div className="pulse-glance-body">
              <div className="pulse-glance-head">
                <h2>Your submission at a glance</h2>
                <span>visible only to you</span>
              </div>
              <div className="pulse-glance-rows">
                {glance.map((row) => (
                  <article
                    key={row.num}
                    className={`pulse-glance-row is-${row.tone}`}
                  >
                    <div className="pulse-glance-row-body">
                      <span className="pulse-glance-num">{row.num}</span>
                      <span className="pulse-glance-title">{row.title}</span>
                      <span className="pulse-glance-likert">{row.likert}</span>
                      <span className="pulse-glance-signal">{row.signal}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="pulse-done-pair">
            <article className="pulse-done-card is-crimson">
              <div className="pulse-done-card-body">
                <div className="pulse-done-card-head">
                  <PencilIcon />
                  <h3>
                    {windowOpen
                      ? "Editable until 1 Sep, 23:59 MYT"
                      : "Responses are locked"}
                  </h3>
                </div>
                <p>
                  {windowOpen
                    ? "Return through the same secure link any time before the window closes. After that the link becomes a thank-you page and your responses lock."
                    : "The window has closed. Your responses are locked for the board readout."}
                </p>
                {windowOpen ? (
                  <Link className="pulse-done-edit" href="/board/survey">
                    Review my answers
                    <ArrowIcon />
                  </Link>
                ) : null}
              </div>
            </article>
          </div>

          <footer className="pulse-done-footer">
            <span>
              Attributed internally · anonymised in anything published
              externally
            </span>
            <a href="mailto:adg@eccouncil.org">Questions? adg@eccouncil.org</a>
          </footer>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path
        d="m8 12 2.5 2.5L16 9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M5 12h14M12 5l7 7-7 7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
