import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: { advisoryBoardMember: { findFirst } },
}));

const { assertDeliverable, isDeliverable, normalizeRecipient } = await import(
  "@/lib/email-allowlist"
);

/** Stands in for the roster: a lookup resolves to a row only for these. */
function roster(...addresses: string[]) {
  findFirst.mockImplementation(async ({ where }) => {
    const wanted = where.email.equals;
    return addresses.some((a) => a.toLowerCase() === wanted.toLowerCase())
      ? { id: 1 }
      : null;
  });
}

beforeEach(() => {
  findFirst.mockReset();
  roster("kbaxter@salesforce.com", "alacea@gmail.com");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeRecipient", () => {
  it("trims and lowercases, matching how the roster stores addresses", () => {
    expect(normalizeRecipient("  Kbaxter@Salesforce.COM ")).toBe(
      "kbaxter@salesforce.com",
    );
  });
});

describe("isDeliverable", () => {
  it("accepts an address held in the roster's email column", async () => {
    await expect(isDeliverable("kbaxter@salesforce.com")).resolves.toBe(true);
    await expect(isDeliverable("alacea@gmail.com")).resolves.toBe(true);
  });

  it("refuses an address that is not in the column", async () => {
    await expect(isDeliverable("attacker@example.com")).resolves.toBe(false);
  });

  it("refuses a member who has no address on file", async () => {
    roster();
    await expect(isDeliverable("nobody@example.com")).resolves.toBe(false);
  });

  it("ignores surrounding whitespace and case", async () => {
    await expect(isDeliverable("  KBaxter@Salesforce.com  ")).resolves.toBe(
      true,
    );
  });

  it("refuses an empty address without troubling the database", async () => {
    await expect(isDeliverable("")).resolves.toBe(false);
    await expect(isDeliverable("   ")).resolves.toBe(false);
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("does not treat a superstring of a roster address as a match", async () => {
    await expect(
      isDeliverable("kbaxter@salesforce.com.attacker.example"),
    ).resolves.toBe(false);
    await expect(isDeliverable("xkbaxter@salesforce.com")).resolves.toBe(false);
  });

  it("queries on the normalized address, not the raw input", async () => {
    await isDeliverable("  KBaxter@Salesforce.com  ");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: { equals: "kbaxter@salesforce.com", mode: "insensitive" } },
      }),
    );
  });
});

describe("assertDeliverable", () => {
  it("stays silent for an address on the roster", async () => {
    await expect(
      assertDeliverable("kbaxter@salesforce.com"),
    ).resolves.toBeUndefined();
  });

  it("throws for an address off the roster", async () => {
    await expect(assertDeliverable("attacker@example.com")).rejects.toThrow(
      "is not one of them",
    );
  });

  it("names the rejected address so the operator sees which send was blocked", async () => {
    await expect(assertDeliverable("Attacker@Example.com")).rejects.toThrow(
      /attacker@example\.com/,
    );
  });

  it("fails closed when the roster holds no addresses at all", async () => {
    roster();
    await expect(
      assertDeliverable("kbaxter@salesforce.com"),
    ).rejects.toThrow("Delivery is restricted");
  });
});
