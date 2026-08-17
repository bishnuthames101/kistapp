# Kist Poly Clinic — status and what's next

Status as of **2026-08-17**.

This is the single living document for the project. `did.md` and `handover.md`
were merged into it and deleted — they were session records whose "what I did"
sections `git log` already holds, and whose action items had drifted out of date
in three places. Anything still live from them is below. To read them anyway:
`git show 2fde9ac:handover.md`.

---

## Status in one line

**The code is in good shape and fully backed up. The running app is not**, because
it has no working database connection — and nothing here has been verified
against a live one.

### Code: green

| Check | Result |
|---|---|
| `npm run lint` | 0 errors, 56 warnings (warnings by choice, so CI stays green) |
| `npm run typecheck` | clean |
| `npm run test` | 78 passing, 5 files |
| `npm run build` | exit 0 |

Working tree clean, `master` in sync with `origin/master`.

### What works right now

Password reset exists and is sound end to end in code. Booking reflects real
doctor schedules with a database-level guard against double-booking. Rate
limiting no longer fails open on the wrong side, and no longer accepts forged
identity headers. The cart survives a refresh. The NABL claim is gone from all 11
places, including the metadata that would have kept asserting it to Google.

### What is unverified — the important part

**Nothing has been run against a real database, by anyone, ever.** `DATABASE_URL`
cannot authenticate, so:

- **Three of the five migrations have never been applied to any database**
  (`password_reset_tokens`, `doctors_and_slots`, `user_password_changed_at`). The
  last is the session-invalidation security fix, which is therefore inert code.
- `db:seed` has never run, so there are no `Doctor` rows — booking has no data
  behind it.
- The Playwright smoke test has never executed against real data.
- Nobody has clicked through booking or password reset on a deployed environment.

Be careful how green that table reads: **`npm run build` succeeds with the
database completely unreachable.** A passing build is not evidence that a schema
change works. The 78 unit tests cover pure logic — slot arithmetic, token
lifecycle, rate-limit fallbacks — and are deliberately database-free, so they
cannot catch this either.

---

## 🚨 Your action items

In the order that unblocks the most. Items 1–3 are the ones to do first.

### Blocking — nothing downstream works until these are done

**1. Reset the Supabase database password.**
Dashboard → Settings → Database → Reset password. Then update `DATABASE_URL`
**and** `DIRECT_URL` in `.env` *and* in Vercel's environment settings. The project
is alive; only the password is stale (see [the probe](#the-supabase-project-is-not-deleted)).
Then:

```bash
npm run db:migrate   # applies all three unapplied migrations
npm run db:seed      # loads the 9 doctors + their weekly schedules
```

`db:seed` is idempotent and also backfills `doctor_id` on existing appointments
by matching the stored doctor name. Re-run it after editing `src/data/doctors.ts`.

**2. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Vercel** — not just `.env`;
they are absent from both. Without them password reset works end to end but the
email is written to the server log instead of sent, so **no patient can actually
reset a password**. The sending domain must be verified in Resend first; the
fallback sender only delivers to the Resend account owner.

Keep `NEXT_PUBLIC_APP_URL` / `NEXTAUTH_URL` set in Vercel too. The reset route now
refuses to send at all if neither is present, and logs why — deliberately, since
the old fallback took the link's host from the request and was an account-takeover
path.

### Security — one dashboard check

**3. Is the `medical-records` Supabase bucket public?**
`/api/upload` hands out `getPublicUrl()` for it. If that bucket is public, anyone
holding a URL reads a patient's medical records with no authentication. Storage →
Buckets. If it is public, the code fix is `createSignedUrl` with a short TTL —
say so and it can be done. **This is the last open item from the original audit.**

### Verification — nobody has ever clicked through this

**4. Smoke-test on a deployed environment**, once step 1 is done:

- [ ] Book with **Dr. Arbind Sah** (scheduled) — you should see real slots from
      his Sun–Wed hours, with taken ones greyed out rather than hidden.
- [ ] Book the **same slot twice in two browsers** — the second must be refused
      with "That slot has just been taken", not silently accepted.
- [ ] Book with **Dr. Prabhakar Shah** (on call) — you should get an explanation
      and a "Send Request" button, **not** a timetable.
- [ ] Confirm the appointment appears in `/dashboard` and `/admin/appointments`.
- [ ] Run the full password reset: request the link, click it, set a new password,
      log in with it. Confirm the old password no longer works.
- [ ] With a session open in a second browser, reset the password and confirm
      that session is logged out (this is what migration 3 enables).
- [ ] Confirm `/admin/prescriptions` 404s and `/api/prescriptions` returns 404.

Or automatically, once the database is reachable:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

**5. Check the Actions tab on GitHub.** CI (`.github/workflows/ci.yml`) runs lint,
typecheck, tests and build on every push, plus an end-to-end job against a
throwaway Postgres. It ran for the first time on 2026-08-17. Run `gh auth login`
on the dev machine if you want run results readable from the terminal.

### Decisions needed from you

**6. Confirm the two doctors' schedules.** Derived from the text in
`src/data/doctors.ts`, not from you:

| Doctor | Days | Hours | Slot length |
|---|---|---|---|
| Dr. Arbind Sah | Sun–Wed | 10:00–17:00 | 30 min |
| Dr. Ranjit Sah | Mon–Fri | 11:00–14:00 | 20 min |

Patients can now book against these, so a wrong entry books someone into a room
with no doctor. **The other 7 are set to "on call"** — tell me if any of them
actually keeps fixed hours and they can be added.

**7. The remaining unsubstantiated claims** — same category as NABL, which was
removed on request. See [Trust claims](#4-replace-or-substantiate-the-trust-claims).

**8. SMS provider and budget**, if you want booking confirmations. See
[the plan](#future-plan--sms--email-confirmation).

**9. Fix the Google Business Profile copy** — "all kinds **pf** services",
lowercase "kist poly clinic" and "balkumari-kharibot", "Xray"/"Ecg" →
"X-ray"/"ECG". Also the Facebook page reads "Kist Polyclinic And Medical Center
Pvt.Ltd." — "Polyclinic" as one word, a fourth spelling variant. The site, logo
and GBP now agree on "Kist Poly Clinic".

Related, from the SEO work: verify the domain in Google Search Console and set
`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (the root layout picks it up
automatically), then submit `https://kistpolyclinic.com.np/sitemap.xml` to Search
Console and Bing Webmaster Tools.

---

## The Supabase project is not deleted

Recorded here because an earlier version of this file concluded it was, and that
conclusion blocked everything for a week.

```
2026-08-16  DATABASE_URL → XX000: tenant/user postgres.qjdjvigcqgypzagoczcn not found
2026-08-17  DATABASE_URL → 28P01: password authentication failed for user "postgres"
            DIRECT_URL   → ENOTFOUND db.qjdjvigcqgypzagoczcn.supabase.co
```

The second probe gets *past* tenant lookup and fails on the password, which means
the pooler resolves tenant `qjdjvigcqgypzagoczcn` and the project exists. The
`ENOTFOUND` on `DIRECT_URL` is Supabase's IPv4 direct-host deprecation, not a
missing project. So the fix is a password reset, not a new project.

---

## Still outstanding — engineering

### 1. Order header with OrderItem children

A 5-item cart is still 5 unrelated `PharmacyOrder` rows. No order ID, no single
total, no shipping record. Create in one `prisma.$transaction`. The dashboard's
"Order Details" table is hardcoded to render exactly one row.

Related: **stock is a boolean enum**, not a quantity
(`StockStatus { IN_STOCK | OUT_OF_STOCK }`), with no decrement on order, so
overselling is guaranteed. The appointment work added a partial unique index to
stop double-booking; pharmacy has the same class of bug and no equivalent guard.

Delete `src/types/pharmacyOrder.ts` with this — it describes an order shape that
does not exist (`items: CartItem[]`, `orderDate`) and will mislead.

### 2. Commit to one visual system

`globals.css` defines a complete glass-morphism vocabulary (20+ tokens). The
homepage uses none of it — solid gradients and hand-rolled Tailwind.
`/epharmacy` is fully glass. `/dashboard` is flat white cards. `/admin` is
unstyled tables. Users cross three visual identities in four clicks. This is the
biggest remaining driver of "feels vague".

Recommendation: delete the glass system — frosted glass over gradients is poor
for medical text legibility and contrast. Then rebuild the dashboard and admin
against whatever you pick. The admin panel is unstyled scaffolding and it is
where staff live all day.

### 3. Reviews: build or remove

`DoctorRating` accepts `reviews` and `canReview` props and renders a review form
whose submit handler does nothing. Either build it (schema + endpoint) or delete
it. With the `Doctor` table now in place, building it is much cheaper than it was.

### 4. Replace or substantiate the trust claims

- ~~**"NABL Certified"**~~ — **removed 2026-08-17** at the product owner's
  request. All 11 occurrences across 7 files are gone, including the two that
  were metadata rather than visible copy (the JSON-LD in `src/lib/seo.ts` and
  `src/app/opengraph-image.tsx`), which would otherwise have kept asserting it to
  Google and to link previews. Replaced with "in-house laboratory". Two adjacent
  phrasings that made the same claim without naming NABL went with it.

  If the clinic *does* hold a Nepali accreditation (NPHL, NAMS), it can now be
  named honestly — nothing is claimed in its place. To re-check, grep `\bNABL\b`
  **with the word boundaries**; a plain search also matches "UNABLE" and a
  case-insensitive one matches "u**nabl**e" / "available".
- **"15,000+ Happy Patients"** and **"50+ Expert Doctors"** — while `/doctors`
  lists 9, contradicting the claim on the same site.
- A hardcoded **"4.8 ★"** on every lab package.
- Three testimonials with stock names and no source.

### 5. Smaller things

All re-verified as still open on 2026-08-17.

- `<img>` tags instead of `next/image` (homepage hero, epharmacy cards, doctor
  avatars) — no lazy-loading or CLS protection. **10 files.**
- No skip link; several pages still lack landmark regions.
- 56 lint warnings, mostly `catch (error: any)` left over from the axios client.
  Warnings by choice so CI stays green; worth clearing gradually.
- `src/services/api.ts` is largely dead legacy code — localStorage JWTs and
  endpoints that no longer exist. Not exploitable (auth is cookie-based), but
  misleading to read.
- No error monitoring. Every failure path is `console.error` into the void.

---

## Future plan — SMS + email confirmation

The clinic sends nothing to anyone. No booking confirmation, no reminder, no
message when an appointment is confirmed or cancelled. In Nepal, for a clinic,
the SMS *is* the reason a patient believes the booking happened — right now the
only confirmation is a toast that disappears in three seconds.

The plumbing exists: `src/lib/mailer.ts` wraps `resend` with a "log instead of
send when unconfigured" fallback. Sending a booking email is a small addition to
it. SMS needs a provider.

### Scope

**Email (via `resend`, already wired):**

- Booking confirmation — doctor, date, time, OPD charge, clinic address. For
  on-call doctors, say plainly that the clinic will call to fix a time.
- Status change — when staff move an appointment to confirmed or cancelled.
- Reminder the day before.

**SMS (needs a provider decision):**

- Same three messages, much shorter. SMS is the one that matters here; email is
  the fallback for patients who gave one.
- Nepali providers to compare: Sparrow SMS, AakashSMS, and Twilio for
  international. Cost per SMS and NTA registration requirements will decide it.
- Phone numbers are already validated to 10 digits starting with 9, so the data
  is clean enough to send to.

### Decide before building

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

## Disabled, not deleted

**The prescription feature** is commented out at the product owner's request
(2026-08-10). Nothing was lost — no patient-facing UI ever created a
prescription. `src/app/api/prescriptions/route.ts` carries the full rationale,
the list of every file to touch when re-enabling, and the two security fixes that
must land first:

1. `prescriptionImageUrl` was accepted as any URL, so a patient could point a
   record at another patient's object key or an attacker-controlled domain that
   staff would click from the admin table.
2. Images were served via `getPublicUrl()` — PHI readable by anyone holding the
   link if the bucket is public.

The `Prescription` Prisma model is deliberately left in place; dropping it would
need a destructive migration and it costs nothing to keep.
