import { describe, expect, it } from "vitest";
import {
  PULSE_WINDOW_CLOSES,
  formatMytStamp,
  ordinal,
  pulseWindowOpen,
} from "@/lib/pulse-window";

describe("pulseWindowOpen", () => {
  it("is open a day before the close", () => {
    expect(pulseWindowOpen(new Date("2026-08-31T00:00:00.000Z"))).toBe(true);
  });

  it("is open on the closing instant itself", () => {
    expect(pulseWindowOpen(PULSE_WINDOW_CLOSES)).toBe(true);
  });

  it("is shut one millisecond after the close", () => {
    expect(pulseWindowOpen(new Date(PULSE_WINDOW_CLOSES.getTime() + 1))).toBe(false);
  });

  it("is shut well after the close", () => {
    expect(pulseWindowOpen(new Date("2026-09-02T00:00:00.000Z"))).toBe(false);
  });
});

describe("formatMytStamp", () => {
  it("renders UTC in Malaysia time (UTC+8)", () => {
    expect(formatMytStamp(new Date("2026-08-27T04:30:00.000Z"))).toBe("27 Aug, 12:30 MYT");
  });

  it("rolls the date forward when +8 crosses midnight", () => {
    expect(formatMytStamp(new Date("2026-08-27T20:05:00.000Z"))).toBe("28 Aug, 04:05 MYT");
  });

  it("zero-pads the hour", () => {
    expect(formatMytStamp(new Date("2026-08-27T00:05:00.000Z"))).toBe("27 Aug, 08:05 MYT");
  });
});

describe("ordinal", () => {
  it.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [21, "21st"],
    [22, "22nd"],
    [23, "23rd"],
    [101, "101st"],
  ])("suffixes %i as %s", (input, expected) => {
    expect(ordinal(input)).toBe(expected);
  });

  it.each([11, 12, 13, 111, 112, 113])("treats the teen %i as 'th'", (input) => {
    expect(ordinal(input)).toBe(`${input}th`);
  });
});
