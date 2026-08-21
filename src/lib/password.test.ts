import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("hashPassword", () => {
  it("encodes scheme, params, salt and key", async () => {
    const stored = await hashPassword("correct horse battery staple");
    const parts = stored.split("$");

    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("scrypt");
    expect(parts.slice(1, 4)).toEqual(["16384", "8", "1"]);
    expect(parts[4].length).toBeGreaterThan(0);
    expect(parts[5].length).toBeGreaterThan(0);
  });

  it("salts each hash so identical passwords do not collide", async () => {
    const [a, b] = await Promise.all([
      hashPassword("same-password"),
      hashPassword("same-password"),
    ]);
    expect(a).not.toBe(b);
  });
});

describe("verifyPassword", () => {
  it("accepts the original password", async () => {
    const stored = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("correct horse battery staple", stored)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("correct horse battery staple");
    await expect(verifyPassword("wrong password", stored)).resolves.toBe(false);
  });

  it("is case sensitive", async () => {
    const stored = await hashPassword("CaseSensitive1");
    await expect(verifyPassword("casesensitive1", stored)).resolves.toBe(false);
  });

  it("returns false for an account with no password set", async () => {
    await expect(verifyPassword("anything", null)).resolves.toBe(false);
  });

  it.each([
    ["empty string", ""],
    ["wrong field count", "scrypt$16384$8$1$salt"],
    ["unknown scheme", "bcrypt$16384$8$1$c2FsdA$a2V5"],
    ["non-numeric params", "scrypt$N$8$1$c2FsdA$a2V5"],
    ["empty key", "scrypt$16384$8$1$c2FsdA$"],
  ])("rejects a malformed stored hash (%s)", async (_label, stored) => {
    await expect(verifyPassword("anything", stored)).resolves.toBe(false);
  });
});
