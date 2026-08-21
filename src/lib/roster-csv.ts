export type RosterCsvRow = {
  line: number;
  name: string;
  title: string;
  email: string | null;
};

export type RosterCsvParse = {
  rows: RosterCsvRow[];
  errors: string[];
};

export const ROSTER_CSV_HEADERS = ["name", "title", "email"] as const;
export const ROSTER_CSV_MAX_ROWS = 500;

/** Minimal RFC 4180 reader: quoted fields, escaped quotes, CRLF or LF. */
function splitRecords(input: string) {
  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quoted) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  return records.filter((entry) => entry.some((cell) => cell.trim().length > 0));
}

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function parseRosterCsv(input: string): RosterCsvParse {
  const records = splitRecords(input.replace(/^﻿/, ""));
  const errors: string[] = [];

  if (records.length === 0) {
    return { rows: [], errors: ["The file is empty."] };
  }

  const header = records[0].map((cell) => cell.trim().toLowerCase());
  const missing = ROSTER_CSV_HEADERS.filter(
    (column) => column !== "email" && !header.includes(column),
  );

  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        `Missing column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}. Expected a header row of name,title,email.`,
      ],
    };
  }

  const nameAt = header.indexOf("name");
  const titleAt = header.indexOf("title");
  const emailAt = header.indexOf("email");

  const rows: RosterCsvRow[] = [];
  const seen = new Set<string>();

  for (let index = 1; index < records.length; index += 1) {
    const line = index + 1;

    if (rows.length >= ROSTER_CSV_MAX_ROWS) {
      errors.push(
        `Stopped at ${ROSTER_CSV_MAX_ROWS} rows; the rest of the file was ignored.`,
      );
      break;
    }

    const record = records[index];
    const name = (record[nameAt] ?? "").trim();
    const title = (record[titleAt] ?? "").trim();
    const rawEmail = emailAt === -1 ? "" : (record[emailAt] ?? "").trim();

    if (!name || !title) {
      errors.push(`Line ${line}: name and title are both required.`);
      continue;
    }

    const email = rawEmail ? rawEmail.toLowerCase() : null;
    if (email && !looksLikeEmail(email)) {
      errors.push(`Line ${line}: "${rawEmail}" is not a valid email address.`);
      continue;
    }

    const key = `${name.toLowerCase()}|${title.toLowerCase()}`;
    if (seen.has(key)) {
      errors.push(`Line ${line}: duplicate of an earlier row, skipped.`);
      continue;
    }
    seen.add(key);

    rows.push({ line, name, title, email });
  }

  return { rows, errors };
}
