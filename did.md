# Security Review & SEO Implementation

Work completed on the KIST Poly Clinic Next.js app.

---

## Part 1 — Security Review

### Fixed (code changes applied)

| # | Issue | Files | Severity |
|---|---|---|---|
| 1 | **Privilege escalation on booking status.** Patients could `PATCH` their own appointment or lab test to `confirmed` / `completed`, self-approving a decision that belongs to the clinic. Non-admins are now restricted to `cancelled`, and only on a booking that isn't already completed or cancelled. | `src/app/api/appointments/[id]/route.ts`, `src/app/api/laboratory-tests/[id]/route.ts` | High |
| 2 | **Attacker-controlled file extension.** The upload route took the stored extension straight from `file.name` (`.html`, `.svg`, path junk). It is now derived from the already-validated MIME type. `Math.random()` in the filename was also replaced with `crypto.randomUUID()`. | `src/app/api/upload/route.ts` | High |
| 3 | **Upload authorization + fail-open MIME check.** Any authenticated patient could upload into the `medicines` catalogue bucket — now admin-only. Separately, a bucket with no `ALLOWED_TYPES` entry accepted *any* MIME type; the check now fails closed. | `src/app/api/upload/route.ts` | High |
| 4 | **Deleted prescription images were never removed from storage.** The delete handler extracted only the last URL segment, but objects are stored as `<userId>/<file>`, so `remove()` silently never matched. Every "deleted" prescription image stayed in the bucket forever. Now extracts the full object key after the bucket name. | `src/app/api/prescriptions/[id]/route.ts` | High (PHI retention) |
| 5 | **No API rate limiting.** `apiLimiter` was defined but never used — only auth endpoints were limited. Now applied across `/api/*` in middleware, bucketed per user when authenticated so patients behind one NAT don't starve each other. Uploads got a dedicated 20/hour limiter. | `src/middleware.ts`, `src/lib/ratelimit.ts` | Medium |
| 6 | **No session revocation.** A deactivated or demoted user kept their JWT claims until expiry. The JWT callback now re-reads `isActive` and `role` from the database, throttled to once per minute to stay off the hot path. | `src/app/api/auth/[...nextauth]/route.ts` | Medium |
| 7 | **Weak security headers.** No HSTS; `'unsafe-eval'` in the production CSP; missing `base-uri`, `form-action`, `object-src`. Added HSTS with preload, COOP, and scoped `unsafe-eval` to dev only. Admin/dashboard/API responses now send `no-store` + `X-Robots-Tag: noindex`. `poweredByHeader` disabled. | `next.config.ts` | Medium |
| 8 | **`typescript.ignoreBuildErrors: true`** was masking type errors. `tsc --noEmit` was already clean, so the flag was removed — type errors now fail the build. | `next.config.ts` | Medium |
| 9 | **Live bug: the Google Maps embed on `/contact` was blocked by CSP.** `frame-src` only allowed `'self'` and `vercel.live`. Added `google.com` and `maps.google.com`. | `next.config.ts` | Live bug |

### Verified clean

- `.env` is gitignored and has never been committed.
- Passwords are bcrypt-hashed; registration hardcodes `role: patient` (no mass-assignment).
- Prisma parameterizes all queries — no SQL injection surface.
- Pharmacy order prices are always re-read from the database, never trusted from the client.
- Ownership checks are present on every per-resource `GET` / `DELETE`.

### Flagged — needs a decision, not changed

1. **Prescription images are served from a public Supabase URL** (`getPublicUrl`). If that bucket is public, anyone holding the URL can read a patient's prescription with no authentication. The fix is `createSignedUrl` with a short TTL, but it also touches the admin and dashboard read paths. **Check the bucket ACLs first.**
2. **Password reset is broken.** `/forgot-password` POSTs to `http://127.0.0.1:8000/api/password-reset/` — a leftover Django endpoint that no longer exists. It also shows *"reset link has been sent"* on failure paths. `resend` is already a dependency; a real implementation needs a reset-token table (Prisma migration).
3. **Inactivity timeouts are very aggressive** — 90s for admins, 120s for patients. Secure, but users will be logged out constantly. Confirm this is intentional.
4. **`src/services/api.ts` is dead legacy code** — localStorage JWTs and `/auth/login`, `/users/me`, `/medical-records` endpoints that no longer exist. Not exploitable (auth is cookie-based), but misleading.
5. **Next 16 deprecation:** `middleware.ts` should be renamed to `proxy.ts`.

---

## Part 2 — SEO

### Infrastructure

| File | Purpose |
|---|---|
| `src/app/sitemap.ts` | 58 URLs — static pages, 12 services, 9 doctors, 20 packages, 8 tests, plus DB-driven pharmacy categories. 1-hour revalidate, with a graceful fallback so a database outage can't take the sitemap down. |
| `src/app/robots.ts` | Allows crawling, disallows `/api/`, `/admin`, `/dashboard`, and auth pages. Declares host + sitemap. |
| `src/app/manifest.ts` | PWA manifest (name, theme colour, icons, categories). |
| `src/app/opengraph-image.tsx` | 1200×630 social card generated at build time via `next/og` — no binary asset to maintain. |
| `src/app/icon.tsx` | App icon, generated the same way. |
| `src/lib/seo.ts` | Single source of truth for NAP data, plus a `pageMetadata()` helper and all JSON-LD builders. |
| `src/components/JsonLd.tsx` | Renders JSON-LD with `<` escaped so a stray `</script>` in data can't break out. |

### Metadata

- `metadataBase` and a title template in the root layout.
- Canonical URL, OpenGraph and Twitter card on **every** page.
- Dynamic routes use `generateMetadata` with real content — e.g. *"Dr. Prabhakar Shah — Consultant General, Laparoscopic & Laser Surgeon"*, with education, experience, NMC number and consultation fee in the description.
- Private routes (`/dashboard`, `/admin`, `/admin-login`, `/login`, `/register`, password reset) are `noindex`.

### Structured data (schema.org)

- `MedicalClinic` with full NAP, geo coordinates, opening hours and services — plus `WebSite` with a search action, both sitewide.
- `Physician` on doctor profiles (specialty, education, consultation fee `Offer`).
- `MedicalTest` on lab tests and packages, including `subTest`, preparation and turnaround time.
- `MedicalProcedure` on service pages.
- `FAQPage` built from the FAQ content already present on service pages.
- `ItemList` on the doctors and services roster pages.
- `BreadcrumbList` throughout.

Page-level schemas reference the clinic by `@id` instead of duplicating it.

### Side benefits

- Doctor, service, package and test pages are now **statically prerendered** (`generateStaticParams`) — they were client-only before.
- `image/avif` and `image/webp` enabled in the image pipeline.

---

## Part 3 — Content & code quality fixes

1. **Duplicated doctor data.** The 9-doctor array was copy-pasted in both `src/app/doctors/page.tsx` and `src/app/doctors/[id]/page.tsx`. Extracted to `src/data/doctors.ts`; both pages and the sitemap now import it.
2. **Wrong currency symbol.** Prices were displayed with **₹ (Indian rupee)** on the homepage and lab-test pages, for a clinic in Nepal. Changed to `Rs.`, matching what the rest of the app already used.

---

## Verification

- `npx tsc --noEmit` — clean.
- `npx next build` — succeeds; all 86 pages generate.
- `robots.txt`, `sitemap.xml` (58 URLs) and `manifest.webmanifest` confirmed in the build output.
- Rendered `/doctors/1` verified to contain `MedicalClinic`, `WebSite`, `Physician` and `BreadcrumbList` JSON-LD, plus the correct canonical and OG tags.

---

## Manual follow-ups

- Verify the domain in Google Search Console and set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — the root layout picks it up automatically.
- Submit `https://kistpolyclinic.com.np/sitemap.xml` to Search Console and Bing Webmaster Tools.
- Make sure the Google Business Profile NAP matches `siteConfig` in `src/lib/seo.ts` character-for-character.
- Decide on the five flagged security items above, especially the public prescription bucket.
