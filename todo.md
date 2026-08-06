# Kist Poly Clinic — findings and remaining work

Status as of 2026-08-06.

**Done:** items 1–7 (the "this week" batch). Shipped in commits `526d166` and
`618e5dc`, on top of `16ffbc7` (security + SEO + branding), `b4db0b0`
(name/address), `80e5c56` (landmark + map), `a0d3509` (social profiles).

**Left:** items 8–15. Item 11's prescription-bucket audit is the only one that
is a live data-exposure risk rather than a quality problem — do that one first.

**Not yet verified by a human:** nobody has clicked through the fixed flows on
the live site. Typecheck and build pass, but there is still no test suite
(item 12). Smoke-test before building on top of this.

---

## The original diagnosis (still accurate, kept for context)

The app felt vague because it was structurally incoherent. Three applications
were layered on top of each other and none was finished:

1. A static marketing site (services, doctors, lab packages — hardcoded in `src/data/*.ts`)
2. A half-migrated Django client (`src/services/api.ts`, snake_case, localStorage JWTs)
3. A new Next.js/Prisma backend (camelCase, cookie sessions, paginated envelopes)

Nobody reconciled the seams. Items 1–7 reconciled them. Items 8–15 are about
the domain model and the product, not the seams.

---

## DONE

### ✅ 1. One shared response contract (was P0 #1 and #2)

Every list route returned `{data,total,page,totalPages}` while every consumer
treated the body as a bare array. The patient dashboard showed "Failed to load"
on three of four tabs; the admin appointments, lab-test, order and medicine
pages threw during render. The lab-test route also hand-converted rows to
snake_case, so the admin page and the dashboard disagreed on field names.

- All collection endpoints now return the same envelope (`src/lib/serialize.ts`).
  Prescriptions gained the envelope and pagination.
- Dropped the snake_case transform from `/api/laboratory-tests`.
- Prisma `Decimal` → number and `@db.Date` → `"YYYY-MM-DD"` at the edge, which
  deleted a lot of `typeof x === 'string' ? parseFloat(x) : x`.
- New `src/lib/api-client.ts`. `getList` unwraps the envelope and throws a named
  `ApiShapeError` when a response is not the expected shape — the guard that
  would have caught this the day it was introduced.
- Rewrote `src/services/api.ts` with types that match what the server sends.
  Removed the dead Django endpoints, the localStorage bearer token, and the 401
  interceptor that hard-redirected and wiped the cart.
- Fixed the dashboard, `PharmacyOrdersSection`, and all four admin pages.

### ✅ 2. Pharmacy checkout (was P0 #3)

Failed 100% of the time: the client sent snake_case Django fields, Zod stripped
them, every order 400'd with "Medicine ID or name is required".

- Sends `medicineId` + `quantity`; the server prices the order.
- Reports partial failures ("Ordered 3 of 5 items") instead of claiming success,
  and keeps failed items in the cart so a retry cannot double-order.
- Unified the duplicate `Medicine` type whose `stock` values (`'In Stock'`)
  never matched the server enum (`'IN_STOCK'`).
- Add to Cart is disabled for out-of-stock medicines.

### ✅ 3. Inactivity timeouts (was P0 #4)

Three mechanisms disagreed and the harshest won: a silent 90s timer in
`AuthContext` always fired before `InactivityMonitor`'s warning, so the "Session
about to expire" modal was unreachable.

- Deleted the silent timer; `InactivityMonitor` is the sole owner.
- One policy in `src/lib/session-policy.ts`, shared with the NextAuth jwt
  callback (which had its own hardcoded copy). **20 min patients, 15 min staff**,
  warning 60s before. Change it there if you disagree.
- Timeout enforced on every token read, not only on an explicit `update()`.
- Server-side timestamp refreshes at most once every 2 minutes; it previously
  fired a session write and a throttled DB read every 5 seconds of mouse movement.

### ✅ 4. Booking modals

All five were hand-rolled overlays with `pointer-events-none` — no scrim, no
dimming, page still scrollable and clickable behind them.

- New `src/components/Modal.tsx`: backdrop, Escape, focus trap, scroll lock,
  `role="dialog"`, focus restored on close. All five dialogs use it.

### ✅ 5. Pharmacy search box

Was bound to state nothing ever read. Now a debounced search against
`/api/medicines?search=`, rendering results in place of the category browse.

### ✅ 6. Navigation

Added Doctors, About and Contact to the navbar (desktop and mobile) — they were
reachable only from the footer. Also closed the account dropdown on outside
click and Escape.

### ✅ 7. "Cash on Delivery" on consultations

Now "Pay at the clinic on the day of your visit".

### ✅ Bonus — found while fixing the above

- **`/doctors/[id]` Book Appointment created nothing.** `handleFinalConfirmation`
  showed "Appointment booked successfully!" and never called the API. Not a
  payload bug — there was no request at all. Now creates the appointment.
- Catch blocks inspecting `error.response` (an axios shape that no longer
  exists) replaced, so failures show a real message.
- Category pages had no cart button — items vanished into a UI you could not
  reach from that page. Added a cart link.

---

## LEFT TO DO

### 🔴 11a. Audit the Supabase prescription bucket — DO THIS FIRST

Prescription images are served via `getPublicUrl`. If the bucket is public,
anyone holding the URL can read a patient's prescription with no
authentication. This is a PHI exposure, not a code-quality issue, and it is
live right now. Fix is `createSignedUrl` with a short TTL, which also touches
the admin and dashboard read paths. **Check the bucket ACLs before anything else.**

### 8. Doctor and DoctorSlot tables

There is no `Doctor` table. Doctors live in `src/data/doctors.ts` and
`Appointment` stores `doctorName` as free text (`prisma/schema.prisma:99`).

- No availability, capacity or conflict detection.
  `src/app/services/[id]/page.tsx` generates 10:00–16:00 slots for every doctor
  on every date from a hardcoded loop. Fifty patients can book the same doctor
  at the same time and all get "booked successfully". The doctor's real schedule
  is displayed one card above as decorative text.
- Rename a doctor and every historical appointment silently detaches.
- `opdCharge` is shown at confirmation but never persisted — appointments carry
  no price.

Generate slots from real schedules; enforce uniqueness on (doctor, date, time).
Without this the booking feature is theatre.

### 9. Order header with OrderItem children

A 5-item cart is still 5 unrelated `PharmacyOrder` rows. No order ID, no single
total, no shipping record. Create in one `prisma.$transaction`. The dashboard's
"Order Details" table is hardcoded to render exactly one row.

Related: **stock is a boolean enum**, not a quantity
(`StockStatus { IN_STOCK | OUT_OF_STOCK }`), with no decrement on order, so
overselling is guaranteed.

### 10. Confirmation email + SMS

`resend` is already a dependency. Nothing notifies anyone — no booking
confirmation, no reminder, no status-change message. In Nepal, for a clinic,
SMS confirmation is the reason a patient trusts the booking.

### 11b. Real password reset

`/forgot-password` POSTs to `http://127.0.0.1:8000/api/password-reset/` — a dead
Django endpoint — and shows "reset link has been sent" regardless. Users who
forget a password are permanently locked out. Needs a reset-token table
(Prisma migration) + `resend`.

### 12. Tests and CI

Zero tests, zero CI. A single integration test on "book → view in dashboard"
would have caught items 1, 2 and 3 in one run.

- Playwright smoke test: register → book appointment → see it in dashboard →
  admin confirms → patient sees "confirmed".
- Run it in GitHub Actions on every push.
- **Linting is also broken:** `npm run lint` calls `next lint`, removed in
  Next 16, and ESLint 9 needs a flat `eslint.config.js` while this project has
  `.eslintrc.json`. Fix alongside CI.

### 13. Commit to one visual system

`globals.css` defines a complete glass-morphism vocabulary (20+ tokens). The
homepage uses none of it — solid gradients and hand-rolled Tailwind.
`/epharmacy` is fully glass. `/dashboard` is flat white cards. `/admin` is
unstyled tables. Users cross three visual identities in four clicks. This is the
biggest remaining driver of "feels vague."

Recommendation: delete the glass system — frosted glass over gradients is poor
for medical text legibility and contrast. Then rebuild the dashboard and admin
against whatever you pick. The admin panel is unstyled scaffolding and it is
where staff live all day.

### 14. Replace or substantiate the trust claims

- "15,000+ Happy Patients", "50+ Expert Doctors" — while `/doctors` lists 9,
  contradicting the claim on the same site.
- A hardcoded "4.8 ★" on every lab package.
- Three testimonials with stock names and no source.
- **"NABL Certified"** — NABL is an *Indian* accreditation body. For a Nepali
  clinic this is very likely wrong, and it is the kind of claim a regulator or
  a competitor will check. It currently appears on the homepage, in the site
  description, and in the JSON-LD.

### 15. Reviews: build or remove

`DoctorRating` accepts `reviews` and `canReview` props and renders a review form
that submits nowhere. Either build it (schema + endpoint) or delete it.

---

## Smaller things noticed, not yet done

- `src/types/pharmacyOrder.ts` describes an order shape that does not exist
  (`items: CartItem[]`, `orderDate`) — dead, will mislead. Delete with item 9.
- The cart is memory-only (`CartContext` uses plain `useState`): refresh or
  navigate away and it empties. Persist to localStorage.
- `<img>` instead of `next/image` in several places (homepage hero, epharmacy
  cards, doctor avatars) — no lazy-loading or CLS protection.
- No skip link; several pages still lack landmark regions.
- `middleware.ts` should be renamed to `proxy.ts` (Next 16 deprecation warning
  on every build).
- Facebook page is named "Kist Polyclinic And Medical Center Pvt.Ltd." —
  "Polyclinic" as one word, a fourth spelling variant. Site, logo and GBP now
  agree on "Kist Poly Clinic".
- GBP business description has typos: "all kinds **pf** services", lowercase
  "kist poly clinic" and "balkumari-kharibot", "Xray"/"Ecg" → "X-ray"/"ECG".

---

The foundation is sound: the schema is well-indexed, ownership checks are
consistent on per-resource routes, prices are re-read server-side, and the
SEO/structured-data layer is above average for a clinic site. Items 1–7 turned
"vague" into "works". Items 8–10 are what turn "works" into a product a patient
trusts.
