import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

// GET /api/laboratory-tests/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const test = await prisma.laboratoryTest.findUnique({
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

    if (!test) {
      return NextResponse.json(
        { error: "Laboratory test not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (test.patientId !== user!.id && user!.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error fetching laboratory test:", error)
    return NextResponse.json(
      { error: "Failed to fetch laboratory test" },
      { status: 500 }
    )
  }
}

// PATCH /api/laboratory-tests/[id]
const updateTestSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  notes: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const body = await req.json()
    const validated = updateTestSchema.parse(body)

    // Get test to check ownership
    const existing = await prisma.laboratoryTest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Laboratory test not found" },
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

    const test = await prisma.laboratoryTest.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(test)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error updating laboratory test:", error)
    return NextResponse.json(
      { error: "Failed to update laboratory test" },
      { status: 500 }
    )
  }
}

// DELETE /api/laboratory-tests/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    // Get test to check ownership
    const existing = await prisma.laboratoryTest.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Laboratory test not found" },
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

    await prisma.laboratoryTest.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Laboratory test deleted successfully" })
  } catch (error) {
    console.error("Error deleting laboratory test:", error)
    return NextResponse.json(
      { error: "Failed to delete laboratory test" },
      { status: 500 }
    )
  }
}
