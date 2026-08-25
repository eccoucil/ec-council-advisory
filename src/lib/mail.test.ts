import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();
const sent: Array<Record<string, string>> = [];

vi.mock("@/lib/prisma", () => ({
  prisma: { advisoryBoardMember: { findFirst } },
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = {
      send: async (payload: Record<string, string>) => {
        sent.push(payload);
        return { error: null };
      },
    };
  },
}));

const { sendAccessCodeEmail, sendPulseReminderEmail } = await import(
  "@/lib/mail"
);

const ON_ROSTER = "kbaxter@salesforce.com";
const OFF_ROSTER = "attacker@example.com";

// No API key plus the console fallback on: an allowed address reaches the
// fallback log, so a blocked one that never logs proves the gate runs first.
beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "");
  vi.stubEnv("MAIL_CONSOLE_FALLBACK", "true");
  vi.stubEnv("NODE_ENV", "development");

  findFirst.mockReset();
  findFirst.mockImplementation(async ({ where }) =>
    where.email.equals === ON_ROSTER ? { id: 1 } : null,
  );
  sent.length = 0;
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendAccessCodeEmail", () => {
  it("refuses an address that is not on the roster", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      sendAccessCodeEmail({ to: OFF_ROSTER, name: "Nobody", code: "123456" }),
    ).rejects.toThrow("Delivery is restricted");

    // The refusal has to beat the console fallback, or the code leaks to the log.
    expect(warn).not.toHaveBeenCalled();
  });

  it("delivers to an address on the roster", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      sendAccessCodeEmail({
        to: ON_ROSTER,
        name: "Kathy Baxter",
        code: "654321",
      }),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});

describe("sendPulseReminderEmail", () => {
  it("refuses an address that is not on the roster", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      sendPulseReminderEmail({
        to: OFF_ROSTER,
        name: "Nobody",
        closesAt: "12 September 2026",
        url: "https://example.test",
      }),
    ).rejects.toThrow("Delivery is restricted");

    expect(warn).not.toHaveBeenCalled();
  });

  it("delivers to an address on the roster", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(
      sendPulseReminderEmail({
        to: ON_ROSTER,
        name: "Kathy Baxter",
        closesAt: "12 September 2026",
        url: "https://example.test",
      }),
    ).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalled();
  });
});

describe("the rendered templates", () => {
  beforeEach(() => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("APP_URL", "https://advisory.eccouncil.org");
  });

  it("points the access-code logo at an absolute URL built from APP_URL", async () => {
    await sendAccessCodeEmail({
      to: ON_ROSTER,
      name: "Kathy Baxter",
      code: "483920",
    });

    // A relative src cannot resolve inside a mail client, so the host matters.
    expect(sent[0].html).toContain(
      'src="https://advisory.eccouncil.org/ec-council-logo.jpg"',
    );
  });

  it("puts the same logo in the reminder", async () => {
    await sendPulseReminderEmail({
      to: ON_ROSTER,
      name: "Kathy Baxter",
      closesAt: "1 Sep 2026, 23:59 MYT",
      url: "https://advisory.eccouncil.org",
    });

    expect(sent[0].html).toContain(
      'src="https://advisory.eccouncil.org/ec-council-logo.jpg"',
    );
  });

  it("keeps the brand readable when a client blocks the image", async () => {
    await sendAccessCodeEmail({ to: ON_ROSTER, name: "K", code: "111111" });

    // Alt text plus the colour it is styled in: this is all a recipient with
    // images off will see where the wordmark should be.
    expect(sent[0].html).toContain('alt="EC-Council"');
    expect(sent[0].html).toMatch(/alt="EC-Council"[^>]*color:#9F1D1D/);
  });

  it("does not leave a trailing slash doubled up in the URL", async () => {
    vi.stubEnv("APP_URL", "https://advisory.eccouncil.org/");
    await sendAccessCodeEmail({ to: ON_ROSTER, name: "K", code: "111111" });

    expect(sent[0].html).toContain(
      'src="https://advisory.eccouncil.org/ec-council-logo.jpg"',
    );
  });
});
