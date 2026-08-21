"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { bindMember, requestOtp } from "@/app/actions/auth";

export type BoardMemberOption = {
  id: number;
  name: string;
  title: string;
};

export function MemberAccess({ members }: { members: BoardMemberOption[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<BoardMemberOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBinding, startBinding] = useTransition();
  const [isSending, startSending] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return members;
    }

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(needle) ||
        member.title.toLowerCase().includes(needle)
      );
    });
  }, [members, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
    }
  }, [open]);

  function selectMember(member: BoardMemberOption) {
    setError(null);
    startBinding(async () => {
      const result = await bindMember(member.id);
      if (!result.ok) {
        setSelected(null);
        setError(result.error);
        return;
      }

      setSelected({ id: member.id, name: result.name, title: result.title });
      setOpen(false);
      setQuery("");
    });
  }

  function sendOtp() {
    if (!selected) {
      return;
    }

    setError(null);
    startSending(async () => {
      const result = await requestOtp();
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/otp");
    });
  }

  return (
    <div className="access-panel">
      <p className="kicker">Member roster</p>
      <h2 className="panel-title">Find your name</h2>
      <p className="lede">
        Choose your listing, then send a one-time access code to the email on
        file.
      </p>

      <div className="roster">
        <button
          className="roster-trigger"
          type="button"
          aria-expanded={open}
          aria-controls="member-list"
          onClick={() => setOpen((value) => !value)}
          disabled={isBinding || isSending}
        >
          <span className="roster-trigger-copy">
            <span className="roster-trigger-name">
              {selected ? selected.name : "Select your name"}
            </span>
            {selected ? (
              <span className="roster-title">{selected.title}</span>
            ) : null}
          </span>
          <span className="roster-count">
            {selected ? "Change" : `${members.length} seated`}
          </span>
        </button>

        {open ? (
          <div className="roster-panel" id="member-list" role="listbox">
            <input
              ref={searchRef}
              className="roster-search"
              type="search"
              placeholder="Search the board…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((index) =>
                    Math.min(index + 1, Math.max(filtered.length - 1, 0)),
                  );
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                }
                if (event.key === "Enter" && filtered[activeIndex]) {
                  event.preventDefault();
                  selectMember(filtered[activeIndex]);
                }
                if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              disabled={isBinding || isSending}
            />

            <div className="roster-list">
              {filtered.length === 0 ? (
                <p className="roster-empty">No members match that search.</p>
              ) : (
                filtered.map((member, index) => (
                  <button
                    key={member.id}
                    className={
                      index === activeIndex
                        ? "roster-item is-active"
                        : "roster-item"
                    }
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectMember(member)}
                    disabled={isBinding || isSending}
                  >
                    <span className="roster-name">{member.name}</span>
                    <span className="roster-title">{member.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>

      <button
        className={`primary-btn send-otp-btn${isSending ? " sending" : ""}`}
        type="button"
        onClick={sendOtp}
        disabled={!selected || isBinding || isSending}
      >
        {isSending ? "Sending code…" : "Send OTP now"}
      </button>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
