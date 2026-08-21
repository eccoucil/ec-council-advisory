"use server";

import { revalidatePath } from "next/cache";
import { sendPulseReminderEmail } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { parseRosterCsv } from "@/lib/roster-csv";
import {
  formatMytStamp,
  isPulseWindowOpen,
  PULSE_WINDOW_CLOSES,
  PULSE_WINDOW_ID,
} from "@/lib/pulse-window";
import { getSession } from "@/lib/session";

const MAX_CSV_BYTES = 512 * 1024;
/** A single click should never fan out to the whole roster unnoticed. */
const MAX_REMINDERS_PER_RUN = 50;

export type UploadRosterResult =
  | { ok: true; created: number; updated: number; warnings: string[] }
  | { ok: false; error: string; warnings?: string[] };

export type ResendResult =
  | { ok: true; sent: number; failed: number; errors: string[] }
  | { ok: false; error: string };

export type CloseWindowResult =
  | { ok: true; closedAt: string }
  | { ok: false; error: string };

async function adminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

function refreshConsole() {
  revalidatePath("/admin");
  revalidatePath("/admin/roster");
  revalidatePath("/admin/agenda", "layout");
}

export async function uploadRoster(
  formData: FormData,
): Promise<UploadRosterResult> {
  const session = await adminSession();
  if (!session) {
    return { ok: false, error: "Administrator access is required." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a CSV file to upload." };
  }

  if (file.size > MAX_CSV_BYTES) {
    return { ok: false, error: "That file is larger than 512 KB." };
  }

  const { rows, errors } = parseRosterCsv(await file.text());

  if (rows.length === 0) {
    return {
      ok: false,
      error: errors[0] ?? "No usable rows were found in that file.",
      warnings: errors.slice(1),
    };
  }

  let created = 0;
  let updated = 0;
  const warnings = [...errors];

  for (const row of rows) {
    try {
      // An email already held by another seat would break its unique index,
      // so the row is reported rather than silently dropped.
      if (row.email) {
        const clash = await prisma.advisoryBoardMember.findUnique({
          where: { email: row.email },
          select: { name: true, title: true },
        });
        if (clash && (clash.name !== row.name || clash.title !== row.title)) {
          warnings.push(
            `Line ${row.line}: ${row.email} already belongs to ${clash.name}, skipped.`,
          );
          continue;
        }
      }

      const existing = await prisma.advisoryBoardMember.findUnique({
        where: { name_title: { name: row.name, title: row.title } },
        select: { id: true },
      });

      await prisma.advisoryBoardMember.upsert({
        where: { name_title: { name: row.name, title: row.title } },
        create: {
          name: row.name,
          title: row.title,
          email: row.email,
          role: "MEMBER",
        },
        update: row.email ? { email: row.email } : {},
      });

      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    } catch (error) {
      warnings.push(
        `Line ${row.line}: ${error instanceof Error ? error.message : "could not be saved"}.`,
      );
    }
  }

  refreshConsole();
  return { ok: true, created, updated, warnings };
}

export async function resendPending(): Promise<ResendResult> {
  const session = await adminSession();
  if (!session) {
    return { ok: false, error: "Administrator access is required." };
  }

  if (!(await isPulseWindowOpen())) {
    return { ok: false, error: "The window is closed, so reminders would be moot." };
  }

  const pending = await prisma.advisoryBoardMember.findMany({
    where: {
      role: "MEMBER",
      email: { not: null },
      pulseSubmission: { is: null },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
    take: MAX_REMINDERS_PER_RUN,
  });

  if (pending.length === 0) {
    return { ok: false, error: "Nobody is pending a reminder right now." };
  }

  const url = process.env.APP_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const closesAt = formatMytStamp(PULSE_WINDOW_CLOSES);

  let sent = 0;
  const errors: string[] = [];

  for (const member of pending) {
    if (!member.email) {
      continue;
    }
    try {
      await sendPulseReminderEmail({
        to: member.email,
        name: member.name,
        closesAt,
        url,
      });
      sent += 1;
    } catch (error) {
      errors.push(
        `${member.name}: ${error instanceof Error ? error.message : "send failed"}`,
      );
    }
  }

  refreshConsole();
  return { ok: true, sent, failed: errors.length, errors: errors.slice(0, 5) };
}

export async function closePulseWindow(): Promise<CloseWindowResult> {
  const session = await adminSession();
  if (!session) {
    return { ok: false, error: "Administrator access is required." };
  }

  const existing = await prisma.pulseWindow.findUnique({
    where: { id: PULSE_WINDOW_ID },
    select: { closedAt: true },
  });

  if (existing?.closedAt) {
    return { ok: false, error: "The window is already closed." };
  }

  const closedAt = new Date();
  await prisma.pulseWindow.upsert({
    where: { id: PULSE_WINDOW_ID },
    create: { id: PULSE_WINDOW_ID, closedAt, closedBy: session.memberId },
    update: { closedAt, closedBy: session.memberId },
  });

  refreshConsole();
  revalidatePath("/board", "layout");
  return { ok: true, closedAt: formatMytStamp(closedAt) };
}
