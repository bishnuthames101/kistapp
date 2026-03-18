import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/auth"
import { z } from "zod"

// GET /api/pharmacy-orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const { id } = await params
    const order = await prisma.pharmacyOrder.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            name: true,
            phone: true,
            email: true,
          }
        },
        medicine: true,
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Check ownership
    if (order.patientId !== user!.id && user!.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching pharmacy order:", error)
    return NextResponse.json(
      { error: "Failed to fetch pharmacy order" },
      { status: 500 }
    )
  }
}

// PATCH /api/pharmacy-orders/[id] - Update order status
const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "completed", "failed"]).optional(),
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
    const validated = updateOrderSchema.parse(body)

    // Get order to check ownership
    const existing = await prisma.pharmacyOrder.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Only order owner can cancel, only admin can update other statuses
    if (validated.status === "cancelled") {
      if (existing.patientId !== user!.id && user!.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }

      // Can't cancel delivered orders
      if (existing.status === "delivered") {
        return NextResponse.json(
          { error: "Cannot cancel delivered orders" },
          { status: 400 }
        )
      }
    } else {
      // Admin only for other status updates
      if (user!.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        )
      }
    }

    const order = await prisma.pharmacyOrder.update({
      where: { id },
      data: validated,
      include: {
        medicine: true,
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error updating pharmacy order:", error)
    return NextResponse.json(
      { error: "Failed to update pharmacy order" },
      { status: 500 }
    )
  }
}

// DELETE /api/pharmacy-orders/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireAdmin()
    if (error) return error

    const { id } = await params
    await prisma.pharmacyOrder.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting pharmacy order:", error)
    return NextResponse.json(
      { error: "Failed to delete pharmacy order" },
      { status: 500 }
    )
  }
}
