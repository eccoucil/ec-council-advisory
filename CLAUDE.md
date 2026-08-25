@AGENTS.md

# EC-Council AI Advisory Board

Member access and the Board Pulse instrument. Next.js 16 (App Router), Prisma,
Postgres. Board members sign in with a one-time code emailed to the address on
their roster row; administrators sign in with a password at `/admin/login`.

`README.md` covers setup and scripts. What follows is what the code does not say
out loud.

## Sending mail is live, and gated on the roster

`src/lib/mail.ts` is the **only** module that talks to Resend. Both send
functions call `assertDeliverable(to)` from `src/lib/email-allowlist.ts` first,
which permits an address only if it appears in the roster's `email` column.
Anything else is refused before a message is built. The gate is fail-closed: an
empty roster sends nothing rather than everything.

The gate sits *above* the API-key check on purpose. `MAIL_CONSOLE_FALLBACK`
prints access codes to the server log, which is its own disclosure path, so a
blocked address must not reach even that.

The roster holds real addresses of sitting board members, and `RESEND_API_KEY`
may be set locally. **Do not trigger a send to exercise a change** — signing a
member out and back in mails a real executive. Use the tests, which mock Resend.

## The roster is confidential

`prisma/seed.ts` contains the real names, titles, and email addresses of 36
sitting board members. Treat it as client data: never copy an address into an
example, a fixture, a commit message, or anything sent to an external service.
When a change needs a sample address, invent one.

## Schema and seed

Schema changes go through a migration (`pnpm exec prisma migrate dev --name x`)
so the next person can replay them. `prisma db push` is for local iteration only.

`pnpm db:seed` is idempotent and **never deletes**. Two consequences:

- Members are keyed on `(name, title)`. Renaming someone in `prisma/seed.ts`
  without also updating the database creates a *second* row instead of editing
  the first. Change both, or the seed silently duplicates the member.
- Retiring a question leaves its old row behind, and the two question sets then
  behave differently. **Pulse** questions render from
  `src/lib/pulse-instrument.ts`; the `pulse_questions` table is consulted only to
  authorise a save (`src/app/actions/pulse.ts:122`), so a retired pulse question
  lingers in the table but never appears. **Review** questions render straight
  from the table (`src/app/board/review/page.tsx:13`), so a retired review
  question *will still be shown to members* until its row is deleted by hand.

The `pulse_window` upsert uses `update: {}` so a re-seed cannot reopen a window
an administrator has closed. Keep it that way.

## The logo

`EcCouncilLogo` (`src/components/ec-council-logo.tsx`) wraps
`public/ec-council-logo.jpg`. Two traps, both already paid for:

- It takes a **display** `height` and derives the width. Passing the file's
  intrinsic 1527x801 makes `next/image` fetch a 3840px master for a 42px mark.
- Tailwind's preflight forces `height: auto` on every `img`, which changes one
  dimension without the other and trips `next/image`'s aspect-ratio warning. The
  component pins both inline; do not move that sizing into CSS.

The asset is a JPEG on a white ground, so it needs a white backdrop. That is why
`.gate-brief` is flat white and `.ec-logo` uses `mix-blend-mode: multiply`.

In email, the logo needs an absolute URL built from `APP_URL`; a `localhost`
value means it will not load in a real inbox. Its `alt` text is styled to read
"EC-Council" in brand red for clients that block images.

## Checks

`pnpm test` and `pnpm build` are trustworthy. **`pnpm lint` is not** — it reports
hundreds of pre-existing errors from the generated Prisma client in
`src/generated`, which is gitignored but not ESLint-ignored. Lint the files you
touched instead: `npx eslint <paths>`.

Port 3000 is often occupied by a sibling project; start the dev server on another
port (`pnpm dev --port 3007`).
