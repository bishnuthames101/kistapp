/**
 * PRESCRIPTION FEATURE — DISABLED (not deleted).
 * See src/app/api/prescriptions/route.ts for the full rationale and the
 * security fixes required before re-enabling.
 */

import { NextResponse } from "next/server"

const DISABLED = NextResponse.json({ error: "Not found" }, { status: 404 })

export async function GET() {
  return DISABLED
}

export async function PATCH() {
  return DISABLED
}

export async function DELETE() {
  return DISABLED
}

/* ===========================================================================
 * ORIGINAL IMPLEMENTATION — uncomment to restore
 * ===========================================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/auth"
import { supabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase"
import { z } from "zod"

// GET /api/prescriptions/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            name: true,
            phone: true,
            email: true,
          }
        }
      }
    })

    if (!prescription) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (prescription.patientId !== user!.id && user!.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(prescription)
  } catch (error) {
    console.error("Error fetching prescription:", error)
    return NextResponse.json(
      { error: "Failed to fetch prescription" },
      { status: 500 }
    )
  }
}

// PATCH /api/prescriptions/[id] - Update status (admin only)
const updatePrescriptionSchema = z.object({
  status: z.enum(["pending", "verified", "rejected"]).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const body = await req.json()
    const validated = updatePrescriptionSchema.parse(body)

    const prescription = await prisma.prescription.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(prescription)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error updating prescription:", error)
    return NextResponse.json(
      { error: "Failed to update prescription" },
      { status: 500 }
    )
  }
}

// DELETE /api/prescriptions/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    // Get prescription to check ownership
    const existing = await prisma.prescription.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Prescription not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (existing.patientId !== user!.id && user!.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    // Delete file from Supabase Storage
    if (existing.prescriptionImageUrl) {
      try {
        // Extract the object key from the public URL. Uploads are stored under
        // `<userId>/<file>`, so we must keep everything after the bucket name -
        // taking only the last segment silently fails to delete the file.
        const url = new URL(existing.prescriptionImageUrl)
        const marker = `/${STORAGE_BUCKETS.PRESCRIPTIONS}/`
        const markerIndex = url.pathname.indexOf(marker)

        if (markerIndex === -1) {
          throw new Error("Prescription URL does not point at the prescriptions bucket")
        }

        const objectKey = decodeURIComponent(
          url.pathname.slice(markerIndex + marker.length)
        )

        // Delete from storage
        const { error: deleteError } = await supabaseAdmin.storage
          .from(STORAGE_BUCKETS.PRESCRIPTIONS)
          .remove([objectKey])

        if (deleteError) {
          console.error('Failed to delete file from storage:', deleteError)
          // Continue with database deletion even if file deletion fails
        }
      } catch (error) {
        console.error('Error parsing prescription URL:', error)
        // Continue with database deletion
      }
    }

    await prisma.prescription.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Prescription deleted successfully" })
  } catch (error) {
    console.error("Error deleting prescription:", error)
    return NextResponse.json(
      { error: "Failed to delete prescription" },
      { status: 500 }
    )
  }
}

 * =========================================================================== */
