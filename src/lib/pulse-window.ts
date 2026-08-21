const MYT = "Asia/Kuala_Lumpur";

/** Planned roster size. The seated count in the database is authoritative for
 * any rate; this is the target the roster is filled against. */
export const PULSE_ROSTER_SIZE = 38;

/** Board session the pulse belongs to (PRD: invites sent at the close of the
 * 27 Aug meeting). */
export const PULSE_SESSION_DATE = new Date("2026-08-27T00:00:00.000Z");
export const PULSE_WINDOW_CLOSES = new Date("2026-09-01T15:59:59.000Z");

/** Schedule-only check. Use isPulseWindowOpen for anything that gates writes. */
export function pulseWindowOpen(now = new Date()) {
  return now.getTime() <= PULSE_WINDOW_CLOSES.getTime();
}

/**
 * The window is open until the scheduled close passes or an administrator
 * closes it early from the console.
 */
export async function isPulseWindowOpen(now = new Date()) {
  if (!pulseWindowOpen(now)) {
    return false;
  }
  return (await pulseWindowClosedAt()) === null;
}

export async function pulseWindowClosedAt(): Promise<Date | null> {
  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.pulseWindow.findUnique({
    where: { id: PULSE_WINDOW_ID },
    select: { closedAt: true },
  });
  return row?.closedAt ?? null;
}

export const PULSE_WINDOW_ID = 1;

export function formatMytStamp(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: MYT,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${read("day")} ${read("month")}, ${read("hour")}:${read("minute")} MYT`;
}

export function ordinal(n: number) {
  const rem = n % 100;
  if (rem >= 11 && rem <= 13) {
    return `${n}th`;
  }
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}
