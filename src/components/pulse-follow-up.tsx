"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { savePulseAnswer } from "@/app/actions/pulse";

export function PulseFollowUp({
  optedIn,
  optedInCount,
  submitterCount,
  windowOpen,
  gapNote,
}: {
  optedIn: boolean;
  optedInCount: number;
  submitterCount: number;
  windowOpen: boolean;
  gapNote: string | null;
}) {
  const router = useRouter();
  const [on, setOn] = useState(optedIn);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (!windowOpen || pending) {
      return;
    }
    const next = !on;
    setOn(next);
    startTransition(async () => {
      const result = await savePulseAnswer("s6-5", next ? "YES" : "NO");
      if (!result.ok) {
        setOn(!next);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article className="pulse-done-card is-blue">
      <div className="pulse-done-card-body">
        <div className="pulse-done-card-head">
          <PhoneIcon />
          <h3>30-minute follow-up</h3>
          <button
            className={`pulse-toggle${on ? " is-on" : ""}`}
            type="button"
            role="switch"
            aria-checked={on}
            disabled={!windowOpen || pending}
            onClick={toggle}
          >
            <span className="pulse-toggle-knob" />
          </button>
        </div>
        <p>
          {on
            ? `You are opted in. We will reach out in the week of 8 September to go deeper on the gaps you flagged${gapNote ? ` — particularly ${gapNote}` : ""}.`
            : "Opt in and we will reach out in the week of 8 September to go deeper on the gaps you flagged."}
        </p>
        <span className="pulse-done-meta">
          {optedInCount} of {submitterCount}{" "}
          {submitterCount === 1 ? "respondent has" : "respondents have"} opted
          in.
        </span>
      </div>
    </article>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.8 2.1Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
