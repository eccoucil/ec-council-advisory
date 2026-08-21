const MYT = "Asia/Kuala_Lumpur";

export const PULSE_ROSTER_SIZE = 38;
export const PULSE_WINDOW_CLOSES = new Date("2026-09-01T15:59:59.000Z");

export function pulseWindowOpen(now = new Date()) {
  return now.getTime() <= PULSE_WINDOW_CLOSES.getTime();
}

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
