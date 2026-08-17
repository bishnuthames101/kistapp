/**
 * ============================================================================
 * PRESCRIPTION FEATURE — DISABLED (not deleted)
 * ============================================================================
 *
 * Disabled on 2026-08-10 at the product owner's request. The implementation is
 * preserved below verbatim so it can be switched back on later.
 *
 * Nothing was lost by disabling it: no patient-facing UI ever created a
 * prescription. `/api/upload` is called from exactly one place
 * (src/app/admin/medicines/page.tsx), so this endpoint had a live write path
 * with no legitimate caller.
 *
 * ---------------------------------------------------------------------------
 * BEFORE RE-ENABLING, FIX THESE TWO SECURITY ISSUES
 * ---------------------------------------------------------------------------
 *
 * 1. `prescriptionImageUrl` was validated with `z.string().url()` only, so a
 *    patient could point a prescription record at ANY URL — including another
 *    patient's object key, or an attacker-controlled domain that clinic staff
 *    would then click from the admin table. Validate that the URL resolves to
 *    the Supabase prescriptions bucket under the caller's own `<userId>/`
 *    prefix (which src/app/api/upload/route.ts already writes).
 *
 * 2. Prescription images were served through `getPublicUrl()`. If the Supabase
 *    bucket is public, anyone holding the URL reads a patient's prescription
 *    with no authentication at all — a PHI exposure. Switch to
 *    `createSignedUrl()` with a short TTL, and audit the bucket ACLs in the
 *    Supabase dashboard before any real prescription is uploaded.
 *
 * The `Prescription` Prisma model is intentionally left in schema.prisma:
 * dropping it would need a destructive migration, and keeping it costs nothing.
 *
 * Re-enabling: delete the 404 stub, uncomment the block below, then also
 * re-enable the matching blocks in
 *   - src/app/api/prescriptions/[id]/route.ts
 *   - src/app/admin/prescriptions/page.tsx
 *   - src/services/api.ts          (Prescription type + prescriptions client)
 *   - src/app/api/upload/route.ts  (prescriptions bucket in ALLOWED_TYPES)
 *   - src/app/admin/page.tsx       (Pending Prescriptions stat card)
 * ============================================================================
 */

import { NextResponse } from "next/server"

const DISABLED = NextResponse.json({ error: "Not found" }, { status: 404 })

export async function GET() {
  return DISABLED
}

export async function POST() {
  return DISABLED
}

/* ===========================================================================
 * ORIGINAL IMPLEMENTATION — uncomment to restore
 * ===========================================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { paginated, readPageParams } from "@/lib/serialize"
import { z } from "zod"

// GET /api/prescriptions
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const where = user!.role === "admin" ? {} : { patientId: user!.id }

    const { page, limit, skip } = readPageParams(req.url)

    const [prescriptions, total] = await prisma.$transaction([
      prisma.prescription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.prescription.count({ where }),
    ])

    return NextResponse.json(paginated(prescriptions, total, page, limit))
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    )
  }
}

// POST /api/prescriptions
const createPrescriptionSchema = z.object({
  prescriptionImageUrl: z.string().url("Valid image URL is required"),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validated = createPrescriptionSchema.parse(body)

    const prescription = await prisma.prescription.create({
      data: {
        ...validated,
        patientId: user!.id,
        status: "pending",
      },
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error creating prescription:", error)
    return NextResponse.json(
      { error: "Failed to create prescription" },
      { status: 500 }
    )
  }
}

 * =========================================================================== */
