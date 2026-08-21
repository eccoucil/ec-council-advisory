"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { adminSignIn } from "@/app/actions/admin-auth";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();

  function submit() {
    setError(null);
    startSubmitting(async () => {
      const result = await adminSignIn(email, password);
      if (result?.ok === false) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="access-panel">
      <p className="kicker">Administration</p>
      <h2 className="panel-title">Sign in</h2>
      <p className="lede">
        Administrator accounts use a password rather than a one-time code.
      </p>

      <form
        className="credential-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="field-label" htmlFor="admin-email">
          Email
        </label>
        <input
          id="admin-email"
          className="text-input"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />

        <label className="field-label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          className="text-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          className="primary-btn"
          type="submit"
          disabled={isSubmitting || !email || !password}
        >
          {isSubmitting ? "Checking credentials…" : "Enter the console"}
        </button>
      </form>

      <p>
        <Link className="text-btn" href="/">
          Board member access
        </Link>
      </p>
    </div>
  );
}
