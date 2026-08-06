My honest POV: the app feels vague because it is structurally incoherent

It isn't a lack of features. There are 86 pages, a real Postgres schema, NextAuth, Supabase storage, rate limiting, and a genuinely good SEO layer. The problem is that three different applications are layered on top of each other and none of them was finished:

1. A static marketing site (services, doctors, lab packages — all hardcoded in src/data/*.ts)
2. A half-migrated Django client (src/services/api.ts, snake_case, localStorage JWTs)
3. A new Next.js/Prisma backend (camelCase, cookie sessions, paginated envelopes)

Nobody reconciled the seams. That's what "vague" is: you click Book, get a green toast, and nothing you can see ever confirms it happened.

---
P0 — Core user journeys are broken in production

These are not style opinions. They are runtime failures I traced from caller to route.

1. The patient dashboard is non-functional — 3 of its 4 tabs.

Every list API returns a pagination envelope:
// src/app/api/appointments/route.ts:45
return NextResponse.json({ data: appointments, total, page, totalPages })
Every consumer still treats the body as a bare array:
// src/app/dashboard/page.tsx:98-102
const allAppointments = response.data;          // = { data: [...], total, ... }
const upcoming = allAppointments.filter(...)    // TypeError
The catch swallows it and renders "Failed to load appointments. Please try again later." Same bug in src/components/PharmacyOrdersSection.tsx:22-23 and the Lab Tests tab. A patient can never see a booking they made. That is the entire value proposition of having an account.

2. The admin panel crashes on load — same root cause, worse failure mode.

src/app/admin/appointments/page.tsx:43, src/app/admin/lab-tests/page.tsx, and src/app/admin/orders/page.tsx:16-17 all do setState(response.data) then .map() / .filter() on it. There's no try/catch around the render, so this throws during render → error boundary / white screen. The clinic cannot see or confirm a single booking. Combined with #1, appointments go into the database and are seen by no human being.

3. Pharmacy checkout always fails — 100% failure rate.

The client sends the old Django payload:
// src/app/epharmacy/page.tsx:57-66
{ patient_id, medicine_name, price_per_unit, total_amount, delivery_address, ... }
The route validates camelCase and Zod silently strips unknown keys:
// src/app/api/pharmacy-orders/route.ts:55-61
z.object({ medicineId: ..., medicineName: ..., deliveryAddress: ... })
medicineName and medicineId both land as undefined → 400 "Medicine ID or name is required" on every order. Not a single medicine can be bought.

4. Two competing auto-logout systems fight each other, and the aggressive one wins.

- src/contexts/AuthContext.tsx:83-91 — silent logout at 90 s, no warning, for everyone.
- src/components/InactivityMonitor.tsx:19 — warning modal at 105 s, logout at 120 s for patients.

The AuthContext timer fires first, so the "Session about to expire — Stay logged in?" modal is dead code for patients. Real effect: read a doctor's profile for 91 seconds and you are logged out mid-booking, with no explanation. For a clinic site where users read about procedures, this is the single most destructive UX decision in the codebase. did.md flagged it as "confirm this is intentional" — my answer is an unqualified no. 15–30 minutes is the norm; 90 seconds is what you'd use for a banking terminal, and even then you'd warn.

Also note the mousemove listener calls update() every 5 s (InactivityMonitor.tsx:82-93), firing a session refresh — and a throttled DB read in the JWT callback — continuously while anyone moves a mouse.

---
P1 — The domain model doesn't model the business

This is the deeper reason the product feels thin, and no amount of UI polish fixes it.

There is no Doctor table. Doctors live in src/data/doctors.ts. Appointment stores doctorName as a free-text string (prisma/schema.prisma:99). Consequences:

- No availability, no capacity, no conflict detection. src/app/services/[id]/page.tsx:13-24 generates 10:00–16:00 slots for every doctor on every date, from a hardcoded loop. Fifty patients can book Dr. Shah at 10:00 on the same Saturday and all get "Appointment booked successfully!". Meanwhile the doctor's actual schedule is displayed one card above as decorative text (doctor.schedule).
- Rename a doctor and every historical appointment silently detaches.
- The doctor's opdCharge is shown at confirmation but never persisted — the appointment carries no price at all.

There is no Order, only PharmacyOrder line items. A 5-item cart becomes 5 unrelated rows in a for loop (src/app/epharmacy/page.tsx:56-67). No order ID, no single total, no shipping record — and if item 3 fails, items 1–2 are already committed with no rollback. The dashboard's "Order Details" table is hardcoded to render exactly one row.

Stock is a boolean enum, not a quantity. StockStatus { IN_STOCK | OUT_OF_STOCK } — no decrement on order, so overselling is guaranteed.

Nothing notifies anyone. resend is a dependency; no appointment confirmation, no reminder, no status-change email or SMS is ever sent. In Nepal, for a clinic, SMS confirmation isn't a nice-to-have — it's the reason a patient trusts the booking. Right now the booking exists only in a database nobody can read (see P0 #1 and #2).

Password reset is a dead endpoint. /forgot-password POSTs to http://127.0.0.1:8000/api/password-reset/ and displays "reset link has been sent" regardless. Users who forget a password are permanently locked out.

---
UI/UX findings

Two design systems, neither committed to. globals.css defines a complete glass-morphism vocabulary — .glass-card, .glass-button, .glass-modal, .glass-table, 20+ tokens. The homepage (src/app/page.tsx) uses none of it — it's solid blue/purple gradients with shadow-2xl and hand-rolled Tailwind. /epharmacy is fully glass. /dashboard is flat white Bootstrap-ish cards. /admin is unstyled tables. Users cross three visual identities in four clicks. This is the #1 driver of "feels vague." Pick one — I'd delete the glass system; frosted glass over gradients is poor for medical text legibility and contrast.

Booking modals have no backdrop and don't trap the page.
// src/app/services/[id]/page.tsx:203  (also doctors/[id], lab-tests/package/[id])
<div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
pointer-events-none on the overlay means no scrim, no dimming, and the page behind stays scrollable and clickable. The modal appears to float, disconnected. No Escape handler, no focus trap, no role="dialog", no scroll lock. It reads as a rendering glitch rather than a step in a flow.

The pharmacy search box does nothing. searchQuery at src/app/epharmacy/page.tsx:19 is bound to the input and never read again — no filter, no API call. It's a prominent, fully-styled dead control.

The cart is memory-only. CartContext.tsx:18 uses plain useState — no localStorage, no server persistence. Refresh, navigate away and back, or get auto-logged-out at 90 s (see above) and the cart silently empties. Worse: /epharmacy/category/[category] lets you add to cart but has no cart button and no checkout — items vanish into a UI you can't reach from that page.

Navigation omits half the site. Navbar.tsx:42-52 links Home, Services, Lab Tests, ePharmacy. /doctors, /about, and /contact are reachable only from the footer — despite /doctors being the highest-intent page on a clinic site and carrying full Physician JSON-LD. Google can find your doctors; your visitors can't.

Copy-paste errors that destroy credibility. The doctor appointment confirmation modal displays "Payment Method: Cash on Delivery" for an in-clinic consultation (src/app/doctors/[id]/page.tsx). The service booking says "Pay on Visit." Same flow, two answers, one nonsensical.

Unverifiable trust claims. "15,000+ Happy Patients", "50+ Expert Doctors", "NABL Certified", a hardcoded "4.8 ★" on every lab package, and three testimonials with stock names and no source — while /doctors lists 9 doctors, contradicting the 50+ claim on the same site. NABL is an Indian accreditation body; for a Nepali clinic this is very likely wrong and is the kind of claim a regulator or a competitor will check. The DoctorRating component accepts reviews and canReview props and renders a review form that submits nowhere.

Accessibility. No skip link, no focus trapping, modals lack ARIA roles, the Navbar user dropdown has no click-outside/Escape handling, several <img> tags bypass next/image (page.tsx:105, epharmacy, doctor avatars) so there's no lazy-loading or CLS protection on the hero.

---
Engineering process — why these bugs survive

- Zero tests. Zero CI. No *.test.*, no vitest/jest/playwright, no .github/. A single integration test on "book → view in dashboard" catches P0 #1, #2 and #3 in one run.
- TypeScript gives false confidence. did.md reports "tsc --noEmit — clean," and it is. But api.ts:187 declares api.get<Appointment[]>('/appointments') — a hand-written lie about a shape the compiler cannot check, and the admin pages use bare axios.get() returning any. The types are decoration, not verification. Derive client types from the Prisma/Zod schemas, or use zod to parse responses, and these become compile-time errors.
- Three naming conventions in one request path. Prisma camelCase → laboratory-tests/route.ts:46-59 hand-transforms to snake_case → the dashboard reads camelCase → all undefined. The lab-test admin page reads snake_case and works; the patient dashboard reads camelCase and doesn't. Nobody can hold this in their head.
- src/services/api.ts is a live hazard, not dead code. did.md calls it "dead legacy" — that's wrong, and the error matters: dashboard/page.tsx, services/[id]/page.tsx, epharmacy/page.tsx and others import from it today. It still injects localStorage bearer tokens (ignored), and its 401 interceptor does a hard window.location.href = '/login', blowing away React state including the cart.
- A "security & SEO" pass shipped without a smoke test. The pagination envelope that broke every consumer was almost certainly added during that hardening work. did.md verifies sitemap.xml, robots.txt, and JSON-LD render correctly — meticulously — but never once logged in and clicked "Book Appointment." Verification aimed at crawlers, not patients.

---
What I'd do, in order

This week — make the product true.
1. One shared response contract. Either drop the envelope or fix all consumers, and add a typed apiFetch<T> that parses with Zod. Kills P0 #1 and #2.
2. Fix the pharmacy payload to camelCase (P0 #3).
3. Raise inactivity timeout to 20 min, delete the duplicate timer in AuthContext, keep the warning modal (P0 #4).
4. Give the booking modals a real backdrop, Escape, focus trap, scroll lock.
5. Delete the pharmacy search box or wire it to medicines.search.
6. Add /doctors, /about, /contact to the navbar.
7. Fix "Cash on Delivery" on consultations.

This month — make it a system.
8. Doctor and DoctorSlot tables; generate slots from real schedules; enforce uniqueness on (doctor, date, time). Without this the booking feature is theatre.
9. An Order header with OrderItem children, created in one prisma.$transaction.
10. Confirmation email + SMS on booking and on status change. This is what makes the app feel real to a patient.
11. Real password reset (token table + resend), and audit the Supabase prescription bucket — did.md correctly flags that patient prescription images may be on unauthenticated public URLs. Check that today; it's a PHI exposure, not a code-quality issue.
12. Playwright smoke test: register → book appointment → see it in dashboard → admin confirms it → patient sees "confirmed". Run it in GitHub Actions on every push.

Then — make it feel like one product.
13. Commit to one visual system and rebuild the dashboard and admin against it. The admin panel is currently unstyled scaffolding and it's where staff live all day.
14. Replace or substantiate the invented stats, testimonials, star ratings, and the NABL claim.
15. Either build real reviews (schema + endpoint) or remove DoctorRating.

The good news: the foundation is sound. The schema is well-indexed, ownership checks are consistently applied on per-resource routes, prices are correctly re-read server-side, and the SEO/structured-data layer is genuinely above average for a clinic site. What's missing is the connective tissue and someone clicking through the app as a patient. Items 1–7 are roughly a week of work and will change the product from "vague" to "works."