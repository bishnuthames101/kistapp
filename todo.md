# Kist Poly Clinic — what's next

Status as of **2026-08-17** (re-checked; previous status was 2026-08-16).
Everything previously listed as done has been removed from this file; `git log`
is the record of it.

The code is in good shape — `npm run lint` (0 errors, 56 warnings),
`npm run typecheck`, `npm run test` (78 passing) and `npm run build` were all
re-run on 2026-08-17 and all pass.

**The problem is not the code, it is everything downstream of it.** Work through
[Do these first](#do-these-first-2026-08-17) before starting any new feature.

The headline *feature* item is still SMS + email confirmation, but it is blocked
on step 1 below (it needs a live database).

---

## ✅ Done on 2026-08-17

- **Everything is committed and pushed.** The 2026-08-10 backlog went up as one
  commit, followed by the security fixes and the cart/proxy work. `git log` is
  now the record. CI will have run for the first time — check the Actions tab.
- **Four security findings fixed**, all in code that had not shipped yet: the
  password-reset link no longer derives its host from the request (it was a
  reset-poisoning account takeover); the reset email is no longer awaited (the
  timing gap re-created the account-enumeration oracle the generic response
  removes); a completed reset now invalidates existing sessions via
  `users.password_changed_at`; and `cf-connecting-ip` / `x-real-ip` /
  `x-forwarded-for` are no longer trusted blindly, which was a free rate-limit
  bypass on login, registration and password reset. Set `TRUSTED_PROXY_HEADER`
  if you ever put a proxy in front.
- `/api/health` is rate limited, the cart persists to localStorage, and
  `src/middleware.ts` is now `src/proxy.ts`.

---

## 🚨 Do these first (2026-08-17)

In this order. All three need your credentials or a dashboard login; nobody can
do them from the dev machine.

### 1. The Supabase database password is wrong — the project is NOT deleted

This blocks everything else. **The previous entry here said the project looked
deleted. That was wrong**, and this is the corrected finding. Re-probed on
2026-08-17:

```
DATABASE_URL  → 28P01: password authentication failed for user "postgres"
DIRECT_URL    → ENOTFOUND db.qjdjvigcqgypzagoczcn.supabase.co
```

The earlier probe got `XX000: tenant not found`; it now gets past tenant lookup
and fails on the *password*. The pooler resolving tenant
`qjdjvigcqgypzagoczcn` means the project exists. The `ENOTFOUND` on `DIRECT_URL`
is expected since Supabase deprecated the IPv4 direct host and is not evidence
of deletion.

**So the fix is small:** Supabase dashboard → Settings → Database → reset the
database password, then update `DATABASE_URL` (and `DIRECT_URL`) in `.env` *and*
in the Vercel project settings. Then run the migrations — see
[Deploy steps](#deploy-steps).

### 2. `RESEND_API_KEY` / `RESEND_FROM_EMAIL` are still absent from `.env`

Re-confirmed missing on 2026-08-17. Password reset therefore writes the email to
the server log instead of sending it, so **no patient can actually reset a
password**. Set them in the Vercel project settings, not just `.env`. Details in
[Deploy steps](#deploy-steps).

Note the reset route now *refuses to send at all* if neither
`NEXT_PUBLIC_APP_URL` nor `NEXTAUTH_URL` is set, and logs why. Both are present
today; keep them set in Vercel.

### 3. Smoke-test on a deployed environment

Nobody has ever clicked through the booking flow or the password reset. The
six-item checklist is in `handover.md` §4. Do it once step 1 is resolved. Add one
item: after resetting a password, confirm the old session is logged out.

### 4. Only then start SMS + email confirmation

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

> **Blocked as of 2026-08-17** — the database password in `DATABASE_URL` is
> wrong, so neither command below can run. Reset it in the Supabase dashboard
> first; see
> [Do these first, step 1](#1-the-supabase-database-password-is-wrong--the-project-is-not-deleted).

Three migrations are written but **not applied** — `DATABASE_URL` points at
production Supabase, so nothing was run against it automatically. The third,
`20260817120000_user_password_changed_at`, is what makes a password reset log
existing sessions out.

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

All of these were re-verified as still open on 2026-08-17.

- `<img>` tags instead of `next/image` (homepage hero, epharmacy cards, doctor
  avatars) — no lazy-loading or CLS protection. Now **10 files**, not the 13
  previously recorded.
- No skip link; several pages still lack landmark regions.
- 56 lint warnings, mostly `catch (error: any)` left over from the axios client.
  They are warnings by choice so CI stays green; worth clearing gradually.
- No error monitoring. Every failure path is `console.error` into the void.
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
