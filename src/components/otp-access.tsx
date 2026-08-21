"use client";

import { useEffect, useState } from "react";
import { AccessGate, GateStats } from "@/components/access-gate";
import { OtpForm } from "@/components/otp-form";

export type OtpAccessProps = {
  name: string;
  maskedEmail: string;
  codeLength: number;
  expiresAt: string;
  attemptCount: number;
  maxAttempts: number;
};

export function formatRemaining(expiresAt: string, now = Date.now()) {
  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - now);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function useRemaining(expiresAt: string) {
  const [remaining, setRemaining] = useState(() => formatRemaining(expiresAt));

  useEffect(() => {
    function tick() {
      setRemaining(formatRemaining(expiresAt));
    }

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return remaining;
}

export function OtpAccess({
  name,
  maskedEmail,
  codeLength,
  expiresAt: initialExpiresAt,
  attemptCount: initialAttemptCount,
  maxAttempts,
}: OtpAccessProps) {
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [attemptCount, setAttemptCount] = useState(initialAttemptCount);
  const remaining = useRemaining(expiresAt);

  return (
    <AccessGate
      figure="Fig. 02"
      section="Identity verification"
      kicker="Access code issued"
      step="02 / 02"
      title={
        <>
          Enter your
          <span>access code</span>
        </>
      }
      lede="A six-digit code has been issued to the address we hold on file for this seat. It expires ten minutes after issue and can be used once."
      stats={
        <GateStats
          items={[
            { label: "Code length", value: String(codeLength) },
            { label: "Expires in", value: remaining },
            { label: "Attempts", value: `${attemptCount} / ${maxAttempts}` },
          ]}
        />
      }
    >
      <OtpForm
        name={name}
        maskedEmail={maskedEmail}
        codeLength={codeLength}
        remaining={remaining}
        onIssued={(nextExpiresAt) => {
          setExpiresAt(nextExpiresAt);
          setAttemptCount(0);
        }}
        onAttempt={(nextAttemptCount) => setAttemptCount(nextAttemptCount)}
      />
    </AccessGate>
  );
}
