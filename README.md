# EC-Council AI Advisory Board

Member access and the Board Pulse instrument for the EC-Council Artificial
Intelligence Advisory Board. Next.js 16 (App Router) with Prisma and Postgres.

Board members sign in with a one-time code sent to the address held for them on
the roster; administrators sign in with a password at `/admin/login`.

## Setup

Requires Node 20+, pnpm, and Docker.

```bash
pnpm install
cp .env.example .env      # then fill in the blanks, see below
pnpm db:up                # Postgres 16 in Docker, on port 5436
pnpm db:migrate           # creates every table from prisma/migrations
pnpm db:seed              # loads the roster and both question sets
pnpm dev
```

That is the whole path from a fresh clone to a working local instance. You do
not need a database dump: `db:migrate` builds the schema and `db:seed` fills it.

### Environment

`.env.example` lists every variable. The ones that matter on day one:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection. The default matches `docker-compose.yml`. |
| `AUTH_SECRET` | Signs sessions and binds OTP hashes. Any long random string locally. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeds the administrator account. Without them `db:seed` skips it and says so. |
| `RESEND_API_KEY` | Mail delivery. Leave empty locally and set `MAIL_CONSOLE_FALLBACK=true` to print access codes to the server log instead of sending. |
| `APP_URL` | Absolute base for links **and the logo** in emails. A `localhost` value means the logo will not load in a real inbox. |

## What the seed contains

`pnpm db:seed` is idempotent — run it as often as you like.

- **36 board members**, each with name, title, and email address
- **50 review questions** (`prisma/questions.ts`)
- **35 pulse questions** (`src/lib/pulse-instrument.ts`)
- The **pulse window** singleton, left open
- The **administrator** account, from `ADMIN_EMAIL` / `ADMIN_PASSWORD`

Members are matched on `(name, title)`, so renaming a member in `prisma/seed.ts`
without updating the database creates a second row rather than editing the first.

The seed never deletes, and the two question sets differ in where they are read
from. Pulse questions render from `src/lib/pulse-instrument.ts`, so a retired one
lingers in `pulse_questions` without ever appearing. Review questions render from
the `review_questions` table, so a retired one stays visible to members until its
row is removed by hand.

## Mail

Delivery is restricted to addresses that appear in the roster's `email` column —
see `src/lib/email-allowlist.ts`. Anything else is refused before a message is
built, which covers both access codes and the admin reminder batch, since
`src/lib/mail.ts` is the only module that talks to Resend.

The gate is fail-closed: an empty roster sends nothing rather than everything.

## Scripts

| Command | Does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build |
| `pnpm test` | Vitest suite |
| `pnpm lint` | ESLint |
| `pnpm db:up` / `db:down` | Start / stop the Postgres container |
| `pnpm db:migrate` | Apply migrations (`prisma migrate deploy`) |
| `pnpm db:push` | Sync the schema without a migration, for local iteration |
| `pnpm db:seed` | Load roster, questions, admin |
| `pnpm db:studio` | Prisma Studio |

Schema changes should go through a migration so the next person can replay them:
`pnpm exec prisma migrate dev --name <what-changed>`.
