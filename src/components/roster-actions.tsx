"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  closePulseWindow,
  resendPending,
  uploadRoster,
} from "@/app/actions/admin-roster";
import { LockIcon, SendIcon, UploadIcon } from "@/components/admin-icons";

type RosterActionsProps = {
  pending: number;
  closed: boolean;
  closesAt: string;
};

type Notice = { tone: "ok" | "warn" | "error"; text: string };

const NOTICE_STYLE = {
  ok: { color: "#0F6E5C", background: "#E8F2EE" },
  warn: { color: "#B87514", background: "#FBF1E2" },
  error: { color: "#C4122F", background: "#FAEDEF" },
};

const CHIP =
  "flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[6px] border bg-white px-[14px] text-[12.5px] text-[#5A6069] disabled:cursor-not-allowed disabled:opacity-55";

export function RosterActions({ pending, closed, closesAt }: RosterActionsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [confirming, setConfirming] = useState<"resend" | "close" | null>(null);
  const [isBusy, startAction] = useTransition();

  function run(work: () => Promise<Notice>) {
    setConfirming(null);
    startAction(async () => {
      setNotice(await work());
    });
  }

  function onFile(file: File | undefined) {
    if (!file) {
      return;
    }

    const data = new FormData();
    data.set("file", file);

    run(async () => {
      const result = await uploadRoster(data);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
      if (!result.ok) {
        return { tone: "error", text: result.error };
      }
      const summary = `Roster updated: ${result.created} added, ${result.updated} matched.`;
      return result.warnings.length > 0
        ? {
            tone: "warn",
            text: `${summary} ${result.warnings.length} row${result.warnings.length === 1 ? "" : "s"} skipped — ${result.warnings.slice(0, 2).join(" ")}`,
          }
        : { tone: "ok", text: summary };
    });
  }

  return (
    <div className="flex w-full flex-col items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-[10px]">
        <input
          ref={fileRef}
          className="hidden"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => onFile(event.target.files?.[0])}
        />

        <button
          className={CHIP}
          style={{ borderColor: "#CFCEC8" }}
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isBusy}
        >
          <UploadIcon className="h-[14px] w-[14px] text-[#8E949C]" />
          Upload roster CSV
        </button>

        <button
          className={CHIP}
          style={{ borderColor: "#CFCEC8" }}
          type="button"
          onClick={() => setConfirming(confirming === "resend" ? null : "resend")}
          disabled={isBusy || closed || pending === 0}
          title={
            closed
              ? "The window is closed."
              : pending === 0
                ? "Nobody is pending a reminder."
                : undefined
          }
        >
          <SendIcon className="h-[14px] w-[14px] text-[#8E949C]" />
          {isBusy ? "Working…" : `Resend to ${pending} pending`}
        </button>

        <button
          className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-[6px] border px-4 text-[12.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-55"
          style={{
            borderColor: "#C4122F",
            backgroundColor: "#FAEDEF",
            color: "#C4122F",
          }}
          type="button"
          onClick={() => setConfirming(confirming === "close" ? null : "close")}
          disabled={isBusy || closed}
        >
          <LockIcon className="h-[14px] w-[14px]" />
          {closed ? "Window closed" : "Close window"}
        </button>
      </div>

      <ConfirmModal
        open={confirming === "resend"}
        title="Send reminders"
        text={`Send a reminder email to ${pending} member${pending === 1 ? "" : "s"} who have not submitted? Each one gets a link to the board page, where they request their own access code.`}
        confirmLabel="Send reminders"
        onCancel={() => setConfirming(null)}
        onConfirm={() =>
            run(async () => {
              const result = await resendPending();
              if (!result.ok) {
                return { tone: "error", text: result.error };
              }
              return result.failed === 0
                ? {
                    tone: "ok",
                    text: `Sent ${result.sent} reminder${result.sent === 1 ? "" : "s"}.`,
                  }
                : {
                    tone: "warn",
                    text: `Sent ${result.sent}, ${result.failed} failed — ${result.errors.join("; ")}`,
                  };
          })
        }
      />

      <ConfirmModal
        open={confirming === "close"}
        tone="danger"
        title="Close the window"
        text={`Close the window now? Every response locks immediately and members see a thank-you page instead of the survey. It was scheduled to close ${closesAt}, and this cannot be undone from the console.`}
        confirmLabel="Close the window"
        onCancel={() => setConfirming(null)}
        onConfirm={() =>
            run(async () => {
              const result = await closePulseWindow();
              return result.ok
                ? { tone: "ok", text: `Window closed at ${result.closedAt}.` }
              : { tone: "error", text: result.error };
          })
        }
      />

      {notice ? (
        <p
          className="m-0 max-w-[520px] rounded-[4px] px-3 py-2 text-right text-[12px] leading-[18px]"
          role="status"
          style={{
            color: NOTICE_STYLE[notice.tone].color,
            backgroundColor: NOTICE_STYLE[notice.tone].background,
          }}
        >
          {notice.text}
        </p>
      ) : null}
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  text,
  confirmLabel,
  onConfirm,
  onCancel,
  tone = "normal",
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: "normal" | "danger";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const accent = tone === "danger" ? "#C4122F" : "#14161A";

  return (
    <dialog
      ref={ref}
      className="m-auto w-[min(92vw,470px)] rounded-[6px] border-0 p-0 backdrop:bg-[#14161A]/45"
      // Clicks land on the dialog element itself only when they hit the backdrop.
      onClick={(event) => {
        if (event.target === ref.current) {
          onCancel();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <div className="overflow-hidden rounded-[6px] bg-white pt-[3px]" style={{ backgroundColor: accent }}>
        <div className="flex flex-col gap-3 bg-white px-6 pb-5 pt-6">
          <h2 className="m-0 font-[family-name:var(--font-pulse-display)] text-[19px] font-semibold text-[#14161A]">
            {title}
          </h2>
          <p className="m-0 text-left text-[13px]/[21px] text-[#5A6069]">{text}</p>
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              className="cursor-pointer border-0 bg-transparent p-0 text-[12.5px] text-[#5A6069] hover:underline"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              autoFocus
              className="flex h-9 cursor-pointer items-center rounded-[6px] px-4 text-[12.5px] font-semibold text-white"
              style={{ backgroundColor: accent }}
              type="button"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
