<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Stack: Next.js 16 (App Router, Turbopack) + Prisma + PostgreSQL. The app is the "EC-Council AI Advisory Board Pulse" — member OTP access (`/`, `/otp`) leading to a Board Pulse survey (`/board`, `/board/survey`). Standard commands live in `package.json` scripts and `README.md`; the notes below are only the non-obvious cloud caveats.

Environment file: copy `.env.example` to `.env`. `AUTH_SECRET` must be a non-empty value (HMAC for OTP hashing + JWT session/access-intent cookies); any random hex string works for dev. `DATABASE_URL` already matches the docker-compose Postgres on port 5436. `RESEND_API_KEY` is only needed to actually email OTP codes — leave it blank locally (see the OTP note below).

Database (Docker): the DB runs in a Postgres container via `pnpm db:up`. Docker is installed but is NOT managed by systemd in this VM — start the daemon manually with `sudo dockerd` and leave it running (a tmux session works well) before `pnpm db:up`. It uses the `fuse-overlayfs` storage driver with the containerd snapshotter disabled (configured in `/etc/docker/daemon.json`; required for Docker 29 + fuse-overlayfs). After the DB is up: `pnpm db:push` (sync schema) then `pnpm db:seed` (loads 37 members, 50 review questions, 37 pulse questions). Only one seeded member has an email on file: Viknesh Krishnan (`viknesh.krishnan@eccouncil.org`).

Run/lint/build: `pnpm dev` serves http://localhost:3000. `pnpm build` succeeds; a Prisma runtime "filesystem access causes the whole project to be traced" warning is expected and non-blocking, and Next 16 does not block builds on ESLint. `pnpm lint` runs but currently reports many issues — the vast majority are in the gitignored generated Prisma client `src/generated/prisma/` (the eslint config overrides the framework default ignores but does not re-add this path), plus a couple of pre-existing findings in `src/components`. This is pre-existing repo state, not a setup issue.

Prisma client: generated into `src/generated/prisma` (gitignored) by `prisma generate`, which runs automatically via `postinstall` and `pnpm db:push`.

Testing the OTP login without email: `requestOtp` (the "Send access code" button) sends the code through Resend and errors without `RESEND_API_KEY`. To exercise the real verify → session → board flow locally without email, mint a challenge directly in the DB, then enter it in the UI:
- code hash = `HMAC_SHA256(AUTH_SECRET, "<memberId>:<lowercased email>:<code>")` (hex), inserted into `otp_challenges` (`emailSentTo` must equal the member's email; `expiresAt` in the future; `attemptCount` 0).
- On `/` select that member (this sets the access-intent cookie via `bindMember`), then go to `/otp` and type the code. Verifying creates the session and redirects to `/board`.
- Submitting a survey requires all 23 required questions answered (Sections 1–5 product/framework blocks + Section 6 sign-off); `/board/survey?s=<n>` jumps to a section.
