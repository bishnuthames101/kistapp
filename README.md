# Kist Poly Clinic

Patient-facing web app for Kist Poly Clinic, Balkumari-Kharibot, Lalitpur, Nepal.
Appointment booking against real doctor schedules, lab test and health checkup
packages, an online pharmacy, a patient dashboard and an admin panel.

**Current status and the outstanding work are in [`todo.md`](./todo.md).** Read it
before starting anything — several things that look finished are blocked on
database access.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth v4, credentials provider, JWT sessions in httpOnly cookies |
| Database | PostgreSQL (Supabase) via Prisma 7 |
| Storage | Supabase Storage |
| Rate limiting | Upstash Redis, with an in-memory fallback that never throws |
| Email | Resend |
| Tests | Vitest (unit), Playwright (e2e) |
| Hosting | Vercel |

## Getting started

Requires Node 18+ and a PostgreSQL database.

```bash
npm install
npm run db:migrate     # apply migrations
npm run db:seed        # load the 9 doctors and their weekly schedules
npm run dev            # http://localhost:3000
```

### Environment variables

`.env` is gitignored and has never been committed. Set these in Vercel as well as
locally:

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Pooled Supabase connection |
| `DIRECT_URL` | yes | Direct connection, for migrations |
| `NEXTAUTH_SECRET` | yes | Session signing |
| `NEXTAUTH_URL` | yes | Also used to build password-reset links |
| `NEXT_PUBLIC_APP_URL` | yes | Preferred source for password-reset links |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side storage writes |
| `UPSTASH_REDIS_REST_URL` | no | Falls back to an in-memory limiter |
| `UPSTASH_REDIS_REST_TOKEN` | no | |
| `RESEND_API_KEY` | no | Without it, emails are logged instead of sent |
| `RESEND_FROM_EMAIL` | no | Domain must be verified in Resend |
| `TRUSTED_PROXY_HEADER` | no | Only set if a proxy that overwrites it is in front |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | no | Search Console |

Password reset **refuses to send** if neither `NEXT_PUBLIC_APP_URL` nor
`NEXTAUTH_URL` is set, and logs why. That is deliberate: the previous fallback
took the link's host from the request, which is attacker-controlled and was an
account-takeover path.

## Scripts

```bash
npm run dev          npm run build        npm start
npm run lint         npm run typecheck
npm run test         npm run test:watch   npm run test:e2e
npm run db:migrate   npm run db:seed
```

**All four of `lint`, `typecheck`, `test` and `build` must pass before you
commit.** CI runs them on every push, plus e2e against a throwaway Postgres.
`lint` currently reports 0 errors and ~56 warnings; the warnings are tolerated on
purpose so CI stays green.

Note that **`build` succeeds even with the database unreachable**, so a green
build is not evidence that a schema change works.

## Layout

```
src/
  app/                Routes; api/ holds all route handlers
  components/         Shared UI (SlotPicker, InactivityMonitor, …)
  contexts/           Auth, Cart, Toast providers  — note the plural
  data/               Static content: doctors, services, lab packages
  lib/                Server logic — see below
  proxy.ts            Route protection + rate limiting (was middleware.ts)
prisma/
  schema.prisma       Models
  migrations/         Includes three not yet applied — see todo.md
  seed.ts             Mirrors src/data/doctors.ts into the database
tests/                Vitest unit tests
e2e/                  Playwright smoke test
```

`src/lib/` is where the logic that has actually broken lives, and where to look
first:

| File | Responsibility |
|---|---|
| `slots.ts` | Slot arithmetic — pure and database-free, so it is exhaustively testable |
| `doctors.ts` | Doctor lookup by cuid, slug or legacy id |
| `password.ts` | Hashing policy, cost, and the anti-enumeration dummy hash |
| `password-reset.ts` | Reset token lifecycle |
| `mailer.ts` | Resend wrapper; logs instead of sending when unconfigured |
| `ratelimit.ts` | Limiter definitions and `checkLimit`, which never throws |
| `request-ip.ts` | Which header may be trusted for the client IP |
| `session-policy.ts` | Inactivity timeouts by role |
| `seo.ts` | Single source of truth for NAP data, metadata and JSON-LD |

## Notes for anyone picking this up

**Doctors have two booking modes.** Only 2 of the 9 keep fixed hours
(`scheduled`) and the patient picks an exact time; the other 7 are `on_call` and
the patient submits a preferred date for the clinic to confirm by phone. Do not
generate slots for on-call doctors — showing a timetable that does not exist is
what the current booking system was built to stop.

**`src/data/doctors.ts` is content, the database is authority.** The file drives
static generation of the marketing pages; `prisma/seed.ts` mirrors it into the
`Doctor` table, which is what booking reads. Re-run `db:seed` after editing it.

**Double-booking is prevented by a partial unique index**, not by the
availability check — two requests can both pass the check, and only one can win
at the database. The loser gets a clean 409. The index is raw SQL in the
migration because Prisma cannot express a partial index.

**The prescription feature is disabled, not deleted.** Each affected file keeps
its original implementation in a block comment.
`src/app/api/prescriptions/route.ts` lists every file to touch when re-enabling
and the two security fixes that must land first.

## Contact

Kist Poly Clinic — Balkumari-Kharibot, Lalitpur, Nepal
+977-01-5202097 · kistpolyclinic@gmail.com
