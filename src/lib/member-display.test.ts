import { describe, expect, it } from "vitest";
import { memberInitials, memberShortName } from "@/lib/member-display";

describe("memberInitials", () => {
  it("takes first and last initials for a full name", () => {
    expect(memberInitials("Ada Lovelace")).toBe("AL");
  });

  it("skips middle names", () => {
    expect(memberInitials("Ada King Lovelace")).toBe("AL");
  });

  it("uses the first two letters of a mononym", () => {
    expect(memberInitials("Prince")).toBe("PR");
  });

  it("collapses irregular whitespace", () => {
    expect(memberInitials("  Ada   Lovelace  ")).toBe("AL");
  });

  it("falls back to a bullet for an empty name", () => {
    expect(memberInitials("   ")).toBe("•");
  });
});

describe("memberShortName", () => {
  it("abbreviates the given name", () => {
    expect(memberShortName("Ada Lovelace")).toBe("A. Lovelace");
  });

  it("keeps the final surname when middle names are present", () => {
    expect(memberShortName("Ada King Lovelace")).toBe("A. Lovelace");
  });

  it("returns a mononym unchanged", () => {
    expect(memberShortName("Prince")).toBe("Prince");
  });

  it("trims a padded name", () => {
    expect(memberShortName("  Prince  ")).toBe("Prince");
  });
});
