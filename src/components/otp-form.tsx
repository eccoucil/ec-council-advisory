"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { requestOtp, verifyOtp } from "@/app/actions/auth";

type OtpFormProps = {
  name: string;
  maskedEmail: string;
  codeLength: number;
  remaining: string;
  onIssued: (expiresAt: string) => void;
  onAttempt: (attemptCount: number) => void;
};

export function OtpForm({
  name,
  maskedEmail,
  codeLength,
  remaining,
  onIssued,
  onAttempt,
}: OtpFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, startVerifying] = useTransition();
  const [isResending, startResending] = useTransition();

  function applyCode(next: string) {
    const digits = next.replace(/\D/g, "").slice(0, codeLength);
    setCode(digits);
    if (digits.length === codeLength) {
      submitCode(digits);
    }
  }

  function submitCode(value = code) {
    if (value.length !== codeLength) {
      return;
    }

    setError(null);
    startVerifying(async () => {
      const result = await verifyOtp(value);
      if (result?.ok === false) {
        setError(result.error);
        if (typeof result.attemptCount === "number") {
          onAttempt(result.attemptCount);
        }
      }
    });
  }

  function resend() {
    setError(null);
    startResending(async () => {
      const result = await requestOtp();
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCode("");
      onIssued(result.expiresAt);
      inputRef.current?.focus();
    });
  }

  return (
    <div className="access-card">
      <h2 className="panel-title">{name}</h2>
      <p className="lede">
        Sent to {maskedEmail}. Enter the six digits below to enter the board.
      </p>

      <label className="field-label" htmlFor="otp">
        One-time code
      </label>

      <div className="otp-cells">
        {Array.from({ length: codeLength }, (_, index) => {
          const filled = Boolean(code[index]);
          const active = index === code.length || (index === codeLength - 1 && code.length === codeLength);
          return (
            <button
              key={index}
              className={active ? "otp-cell is-active" : "otp-cell"}
              type="button"
              tabIndex={-1}
              onClick={() => inputRef.current?.focus()}
            >
              {filled ? code[index] : ""}
            </button>
          );
        })}
        <input
          ref={inputRef}
          id="otp"
          className="otp-cells-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={codeLength}
          value={code}
          aria-label="One-time code"
          onChange={(event) => applyCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submitCode();
            }
          }}
          disabled={isVerifying}
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="board-btn"
        type="button"
        onClick={() => submitCode()}
        disabled={isVerifying || code.length !== codeLength}
      >
        {isVerifying ? "Checking code…" : "Enter the board"}
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
      </button>

      <div className="otp-actions">
        <div className="otp-resend">
          <button
            className="text-btn"
            type="button"
            onClick={resend}
            disabled={isResending}
          >
            {isResending ? "Sending another code…" : "Send the code again"}
          </button>
          <span className="otp-timer">Expires in {remaining}</span>
        </div>
        <Link className="otp-back" href="/">
          <svg viewBox="0 0 13 13" aria-hidden>
            <path
              d="M11 6.5H2.5M6 3 2.5 6.5 6 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Use a different name
        </Link>
      </div>
    </div>
  );
}
