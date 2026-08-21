import { describe, expect, it } from "vitest";
import { ROSTER_CSV_MAX_ROWS, parseRosterCsv } from "@/lib/roster-csv";

const header = "name,title,email";

describe("parseRosterCsv header handling", () => {
  it("reports an empty file", () => {
    expect(parseRosterCsv("")).toEqual({ rows: [], errors: ["The file is empty."] });
  });

  it("rejects a file missing a required column", () => {
    const result = parseRosterCsv("name,email\nAda,ada@example.com");
    expect(result.rows).toEqual([]);
    expect(result.errors[0]).toContain("Missing column: title");
  });

  it("pluralises when several columns are missing", () => {
    const result = parseRosterCsv("email\nada@example.com");
    expect(result.errors[0]).toContain("Missing columns: name, title");
  });

  it("treats email as optional", () => {
    const result = parseRosterCsv("name,title\nAda,Chair");
    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([{ line: 2, name: "Ada", title: "Chair", email: null }]);
  });

  it("accepts columns in any order and any case", () => {
    const result = parseRosterCsv("EMAIL,Title,NAME\nada@example.com,Chair,Ada");
    expect(result.rows).toEqual([
      { line: 2, name: "Ada", title: "Chair", email: "ada@example.com" },
    ]);
  });

  it("strips a UTF-8 BOM before reading the header", () => {
    const result = parseRosterCsv(`﻿${header}\nAda,Chair,ada@example.com`);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(1);
  });
});

describe("parseRosterCsv row handling", () => {
  it("parses a well-formed file and lowercases emails", () => {
    const result = parseRosterCsv(`${header}\nAda Lovelace,Chair,Ada@Example.COM`);
    expect(result.errors).toEqual([]);
    expect(result.rows).toEqual([
      { line: 2, name: "Ada Lovelace", title: "Chair", email: "ada@example.com" },
    ]);
  });

  it("reads quoted fields containing commas and escaped quotes", () => {
    const result = parseRosterCsv(
      `${header}\n"Lovelace, Ada","Chair, Audit ""and"" Risk",ada@example.com`,
    );
    expect(result.rows).toEqual([
      {
        line: 2,
        name: "Lovelace, Ada",
        title: 'Chair, Audit "and" Risk',
        email: "ada@example.com",
      },
    ]);
  });

  it("handles CRLF line endings", () => {
    const result = parseRosterCsv(`${header}\r\nAda,Chair,ada@example.com\r\nGrace,CTO,\r\n`);
    expect(result.errors).toEqual([]);
    expect(result.rows.map((row) => row.name)).toEqual(["Ada", "Grace"]);
    expect(result.rows[1].email).toBeNull();
  });

  it("skips blank lines without reporting them as errors", () => {
    const result = parseRosterCsv(`${header}\nAda,Chair,\n\n   \nGrace,CTO,`);
    expect(result.errors).toEqual([]);
    expect(result.rows).toHaveLength(2);
  });

  it("requires both name and title", () => {
    const result = parseRosterCsv(`${header}\n,Chair,ada@example.com\nGrace,,g@example.com`);
    expect(result.rows).toEqual([]);
    expect(result.errors).toEqual([
      "Line 2: name and title are both required.",
      "Line 3: name and title are both required.",
    ]);
  });

  it("rejects a malformed email and keeps the rest of the file", () => {
    const result = parseRosterCsv(`${header}\nAda,Chair,not-an-email\nGrace,CTO,g@example.com`);
    expect(result.errors).toEqual(['Line 2: "not-an-email" is not a valid email address.']);
    expect(result.rows.map((row) => row.name)).toEqual(["Grace"]);
  });

  it("drops a duplicate name+title pair regardless of case", () => {
    const result = parseRosterCsv(`${header}\nAda,Chair,a@example.com\nADA,chair,b@example.com`);
    expect(result.rows).toHaveLength(1);
    expect(result.errors).toEqual(["Line 3: duplicate of an earlier row, skipped."]);
  });

  it("keeps the same person listed under a different title", () => {
    const result = parseRosterCsv(`${header}\nAda,Chair,a@example.com\nAda,Treasurer,a@example.com`);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toEqual([]);
  });

  it(`stops at ${ROSTER_CSV_MAX_ROWS} rows and says so`, () => {
    const body = Array.from(
      { length: ROSTER_CSV_MAX_ROWS + 10 },
      (_, index) => `Member ${index},Director,member${index}@example.com`,
    ).join("\n");

    const result = parseRosterCsv(`${header}\n${body}`);
    expect(result.rows).toHaveLength(ROSTER_CSV_MAX_ROWS);
    expect(result.errors).toEqual([
      `Stopped at ${ROSTER_CSV_MAX_ROWS} rows; the rest of the file was ignored.`,
    ]);
  });
});
