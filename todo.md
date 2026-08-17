# Kist Poly Clinic — what's next

Status as of **2026-08-16** (re-checked; previous status was 2026-08-10).
Everything previously listed as done has been removed from this file; `git log`
is the record of it.

The code is in good shape — `npm run lint` (0 errors, 55 warnings),
`npm run typecheck`, `npm run test` (75 passing) and `npm run build` were all
re-run on 2026-08-16 and all pass.

**The problem is not the code, it is everything downstream of it.** Nothing from
the 2026-08-10 session has shipped. Work through
[Do these first](#do-these-first-2026-08-16) before starting any new feature.

The headline *feature* item is still SMS + email confirmation, but it is blocked
on step 2 below (it needs a live database).

---

## 🚨 Do these first (2026-08-16)

In this order. Steps 2 and 3 need your credentials or a dashboard login; nobody
can do them from the dev machine.

### 1. Commit and push — nothing is backed up

The last commit is dated **2026-08-06**. The entire 2026-08-10 session — password
reset, rate-limit hardening, the real appointment-slot system, 75 tests, CI — is
sitting **uncommitted in the working tree of one Windows machine**:

- 31 modified files, +2,550 / −840 lines
- ~20 new untracked files: `src/lib/slots.ts`, `password-reset.ts`, `mailer.ts`,
  `password.ts`, `request-ip.ts`, `doctors.ts`, `src/components/SlotPicker.tsx`,
  `tests/`, `e2e/`, `.github/`, both migrations, `prisma/seed.ts`

`origin/master` is in sync with local `master`, so **none of this exists
anywhere else**. One stray `git checkout .` or a disk failure loses the whole
security review and the booking rebuild.

Side effect: the CI pipeline in `.github/workflows/ci.yml` has never run once,
because nothing has been pushed.

This is the most urgent item and it is a five-minute fix.

### 2. The Supabase project looks *deleted*, not paused

This blocks everything else. The 2026-08-10 handover recorded `ENOTFOUND` and
guessed the project was paused. Probed properly on 2026-08-16, it is worse:

```
DATABASE_URL  → XX000: tenant/user postgres.qjdjvigcqgypzagoczcn not found
DIRECT_URL    → ENOTFOUND db.qjdjvigcqgypzagoczcn.supabase.co
```

This is **not** a firewall or a local network problem — TCP to the pooler on
port 5432 succeeds and the pooler's DNS resolves fine. The pooler is up and
actively reporting that tenant `qjdjvigcqgypzagoczcn` does not exist, and the
project's own direct hostname has been removed from DNS. A merely *paused*
Supabase project keeps its DNS record, so this reads as deleted or reclaimed.

**Check the Supabase dashboard** for whether the project was deleted or the free
tier reclaimed it. If it is unrecoverable you need a new project and a fresh
`DATABASE_URL` / `DIRECT_URL` — in which case the migrations apply cleanly from
scratch, which is not a bad outcome.

Until this is resolved: the two migrations cannot be applied, `db:seed` cannot
run, and none of the booking work can be smoke-tested. See
[Deploy steps](#deploy-steps).

### 3. `RESEND_API_KEY` / `RESEND_FROM_EMAIL` are still absent from `.env`

Confirmed missing on 2026-08-16. Password reset therefore writes the email to the
server log instead of sending it, so **no patient can actually reset a
password**. Set them in the Vercel project settings, not just `.env`. Details in
[Deploy steps](#deploy-steps).

### 4. Smoke-test on a deployed environment

Nobody has ever clicked through the booking flow or the password reset. The
six-item checklist is in `handover.md` §4. Do it once step 2 is resolved.

### 5. Only then start SMS + email confirmation

It needs a live database and a provider decision from you (Sparrow SMS vs
AakashSMS vs Twilio). See the plan below.

---

## 🔜 Future plan — SMS + email confirmation

The clinic sends nothing to anyone. No booking confirmation, no reminder, no
message when an appointment is confirmed or cancelled. In Nepal, for a clinic,
the SMS *is* the reason a patient believes the booking happened — right now the
only confirmation is a toast that disappears in three seconds.

The plumbing already exists: `src/lib/mailer.ts` was added for password reset
and wraps `resend` with a "log instead of send when unconfigured" fallback.
Sending a booking email is a small addition to it. SMS needs a provider.

### Scope

**Email (via `resend`, already wired):**

- Booking confirmation — doctor, date, time, OPD charge, clinic address.
  For on-call doctors, say plainly that the clinic will call to fix a time.
- Status change — when staff move an appointment to confirmed or cancelled.
- Reminder the day before.

**SMS (needs a provider decision):**

- Same three messages, much shorter. SMS is the one that matters here; email is
  the fallback for patients who gave one.
- Nepali providers to compare: Sparrow SMS, AakashSMS, and Twilio for
  international. Cost per SMS and NTA registration requirements will decide it.
- Phone numbers are already validated to 10 digits starting with 9, so the data
  is clean enough to send to.

### Things to decide before building

1. **Provider and budget.** Roughly how many appointments a month? At ~NPR 1–2
   per SMS that sets the running cost.
2. **Who gets what.** Patient only, or the clinic desk too? A "new booking"
   message to staff is often what actually makes online booking useful to them.
3. **Language.** Nepali, English, or both in one message.
4. **Opt-out.** Needed if reminders are added; not for transactional
   confirmations.

### Build notes

- Send **after** the database write commits, never inside the transaction — a
  failed SMS must not roll back a real appointment.
- Sending must never change the API response. `sendEmail` already swallows and
  logs failures for exactly this reason; do the same for SMS.
- Retries and delivery status want a queue eventually. For the volume a single
  clinic sees, fire-and-forget with logging is honest and sufficient to start.
- Add the message templates next to `passwordResetEmail` in `src/lib/mailer.ts`
  so the wording lives in one place.

---

## Deploy steps

> **Blocked as of 2026-08-16** — the Supabase project is unreachable and appears
> to have been deleted. Neither command below can run until that is resolved.
> See [Do these first, step 2](#2-the-supabase-project-looks-deleted-not-paused).

Two migrations are written but **not applied** — `DATABASE_URL` points at
production Supabase, so nothing was run against it automatically.

```bash
npm run db:migrate   # prisma migrate deploy
npm run db:seed      # loads the 9 doctors + their weekly schedules
```

`db:seed` is idempotent and also backfills `doctor_id` on existing appointments
by matching the stored doctor name. Re-run it after editing
`src/data/doctors.ts`.

**Also set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`** — re-confirmed still
missing from `.env` on 2026-08-16. Without them password
reset still works end to end, but the email is written to the server log instead
of being delivered — so nobody can actually reset a password. The sending domain
must be verified in Resend.

---

## Still outstanding

### 1. Audit the Supabase storage buckets

The prescription feature is switched off (see below), which removes the
immediate exposure. But `/api/upload` still hands out `getPublicUrl()` for the
`medical-records` bucket. If that bucket is public, anyone with the URL reads a
patient's records with no authentication.

**This is a Supabase dashboard check, not a code change.** Do it before anyone
uploads a medical record. The fix in code is `createSignedUrl` with a short TTL.

### 2. Order header with OrderItem children

A 5-item cart is still 5 unrelated `PharmacyOrder` rows. No order ID, no single
total, no shipping record. Create in one `prisma.$transaction`. The dashboard's
"Order Details" table is hardcoded to render exactly one row.

Related: **stock is a boolean enum**, not a quantity
(`StockStatus { IN_STOCK | OUT_OF_STOCK }`), with no decrement on order, so
overselling is guaranteed. The appointment work just added a partial unique
index to stop double-booking; pharmacy has the same class of bug and no
equivalent guard.

Delete `src/types/pharmacyOrder.ts` with this — it describes an order shape that
does not exist (`items: CartItem[]`, `orderDate`) and will mislead.

### 3. Commit to one visual system

`globals.css` defines a complete glass-morphism vocabulary (20+ tokens). The
homepage uses none of it — solid gradients and hand-rolled Tailwind.
`/epharmacy` is fully glass. `/dashboard` is flat white cards. `/admin` is
unstyled tables. Users cross three visual identities in four clicks. This is the
biggest remaining driver of "feels vague".

Recommendation: delete the glass system — frosted glass over gradients is poor
for medical text legibility and contrast. Then rebuild the dashboard and admin
against whatever you pick. The admin panel is unstyled scaffolding and it is
where staff live all day.

### 4. Replace or substantiate the trust claims

- **"NABL Certified"** — NABL is an *Indian* accreditation body. For a Nepali
  clinic this is very likely wrong, and it is the kind of claim a regulator or a
  competitor will check. Re-counted 2026-08-16: **11 occurrences across 7
  files** (the earlier "8 places" was an undercount).

  | File | Lines |
  |---|---|
  | `src/app/page.tsx` | 117, 147, 353, 355 |
  | `src/app/lab-tests/page.tsx` | 11, 57 |
  | `src/app/lab-tests/package/[id]/page.tsx` | 149 |
  | `src/app/lab-tests/packages/layout.tsx` | 7 |
  | `src/app/about/page.tsx` | 8 |
  | `src/app/opengraph-image.tsx` | 58 |
  | `src/lib/seo.ts` | 17 (JSON-LD) |

  Note two of these are *metadata*, not visible copy — `opengraph-image.tsx` and
  the JSON-LD in `seo.ts` — so they will keep asserting it to Google and to link
  previews even after the visible text is changed. Grep with `\bNABL\b`; a plain
  `NABL` search also matches "UNABLE" and a case-insensitive one matches
  "u**nabl**e" / "available".

  If the clinic holds a Nepali accreditation (NPHL, NAMS) name that instead.
- "15,000+ Happy Patients" and "50+ Expert Doctors" — while `/doctors` lists 9,
  contradicting the claim on the same site.
- A hardcoded "4.8 ★" on every lab package.
- Three testimonials with stock names and no source.

### 5. Reviews: build or remove

`DoctorRating` accepts `reviews` and `canReview` props and renders a review form
whose submit handler does nothing. Either build it (schema + endpoint) or delete
it. With the `Doctor` table now in place, building it is much cheaper than it was.

### 6. Smaller things

All of these were re-verified as still open on 2026-08-16.

- The cart is memory-only: refresh or navigate away and it empties. Persist to
  localStorage. The file is `src/contexts/CartContext.tsx` — note the plural
  `contexts/`, there is no `src/context/` directory.
- `<img>` tags instead of `next/image` (homepage hero, epharmacy cards, doctor
  avatars) — no lazy-loading or CLS protection. Now **10 files**, not the 13
  previously recorded.
- No skip link; several pages still lack landmark regions.
- `src/middleware.ts` should be renamed to `src/proxy.ts` (Next 16 deprecation).
  Still not done — the build output already labels it `ƒ Proxy (Middleware)`.
- 55 lint warnings, mostly `catch (error: any)` left over from the axios client.
  They are warnings by choice so CI stays green; worth clearing gradually.
- No error monitoring. Every failure path is `console.error` into the void.
- `/api/health` runs `SELECT 1` and is exempt from rate limiting — a free
  unauthenticated database-query amplifier. Low severity, easy fix.
- Facebook page is named "Kist Polyclinic And Medical Center Pvt.Ltd." —
  "Polyclinic" as one word, a fourth spelling variant. Site, logo and GBP now
  agree on "Kist Poly Clinic".
- GBP business description has typos: "all kinds **pf** services", lowercase
  "kist poly clinic" and "balkumari-kharibot", "Xray"/"Ecg" → "X-ray"/"ECG".

---

## Disabled, not deleted

**The prescription feature** is commented out at the product owner's request
(2026-08-10). Nothing was lost — no patient-facing UI ever created a
prescription. `src/app/api/prescriptions/route.ts` carries the full rationale,
the list of every file to touch when re-enabling, and the two security fixes
that must land first:

1. `prescriptionImageUrl` was accepted as any URL, so a patient could point a
   record at another patient's object key or an attacker-controlled domain that
   staff would click from the admin table.
2. Images were served via `getPublicUrl()` — PHI readable by anyone holding the
   link if the bucket is public.

The `Prescription` Prisma model is deliberately left in place; dropping it would
need a destructive migration and it costs nothing to keep.

---

## Verification status

**Re-run and confirmed passing on 2026-08-16:**

| Command | Result |
|---|---|
| `npm run lint` | 0 errors, 55 warnings |
| `npm run typecheck` | clean |
| `npm run test` | 75 passing, 5 files |
| `npm run build` | exit 0 |

CI (`.github/workflows/ci.yml`) is configured to run all four on every push,
plus a Playwright smoke test against a throwaway Postgres — but **it has never
actually run**, because the work is still uncommitted and unpushed. Its first
real run will happen when you do step 1.

**Not yet verified by a human:** nobody has clicked through the new booking
flow, the password reset, or the disabled prescription routes on a deployed
environment. The Playwright spec covers register → book → dashboard but has
still not been run against a real database — and cannot be until the Supabase
project is restored. Smoke-test after applying the migrations.
