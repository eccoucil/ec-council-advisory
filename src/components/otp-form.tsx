"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestOtp, verifyOtp } from "@/app/actions/auth";

type OtpFormProps = {
  name: string;
  maskedEmail: string;
};

export function OtpForm({ name, maskedEmail }: OtpFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, startVerifying] = useTransition();
  const [isResending, startResending] = useTransition();

  function submitCode(value = code) {
    setError(null);
    startVerifying(async () => {
      const result = await verifyOtp(value);
      if (result?.ok === false) {
        setError(result.error);
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
    });
  }

  return (
    <div className="access-panel">
      <p className="kicker">Access code issued</p>
      <h2 className="panel-title">{name}</h2>
      <p className="lede">
        A six-digit code is on its way to {maskedEmail}. Enter it below to
        continue.
      </p>

      <label className="field-label" htmlFor="otp">
        One-time code
      </label>
      <input
        id="otp"
        className="otp-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(event) => {
          const next = event.target.value.replace(/\D/g, "").slice(0, 6);
          setCode(next);
          if (next.length === 6) {
            submitCode(next);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && code.length === 6) {
            event.preventDefault();
            submitCode();
          }
        }}
        disabled={isVerifying}
      />

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="primary-btn"
        type="button"
        onClick={() => submitCode()}
        disabled={isVerifying || code.length !== 6}
      >
        {isVerifying ? "Checking code…" : "Enter the board"}
      </button>

      <button
        className="text-btn"
        type="button"
        onClick={resend}
        disabled={isResending}
      >
        {isResending ? "Sending another code…" : "Send OTP again"}
      </button>

      <p>
        <Link className="text-btn" href="/">
          Use a different name
        </Link>
      </p>
    </div>
  );
}
