import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

// GET /api/medicines/[id] - Get single medicine
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const medicine = await prisma.medicine.findUnique({
      where: { id },
    })

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(medicine)
  } catch (error) {
    console.error("Error fetching medicine:", error)
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 }
    )
  }
}

// PATCH /api/medicines/[id] - Update medicine (admin only)
const updateMedicineSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  image: z.string().optional(),
  category: z.string().min(1).optional(),
  stock: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { user, error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    const body = await req.json()
    const validated = updateMedicineSchema.parse(body)

    const medicine = await prisma.medicine.update({
      where: { id },
      data: validated,
    })

    return NextResponse.json(medicine)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error updating medicine:", error)
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    )
  }
}

// DELETE /api/medicines/[id] - Delete medicine (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const { user, error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    await prisma.medicine.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Medicine deleted successfully" })
  } catch (error) {
    console.error("Error deleting medicine:", error)
    return NextResponse.json(
      { error: "Failed to delete medicine" },
      { status: 500 }
    )
  }
}
