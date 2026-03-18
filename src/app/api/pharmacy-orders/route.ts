import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

// GET /api/pharmacy-orders - Get user's orders
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const where = user!.role === "admin" ? {} : { patientId: user!.id }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

    const [orders, total] = await prisma.$transaction([
      prisma.pharmacyOrder.findMany({
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
          },
          medicine: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.pharmacyOrder.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching pharmacy orders:", error)
    return NextResponse.json(
      { error: "Failed to fetch pharmacy orders" },
      { status: 500 }
    )
  }
}

// POST /api/pharmacy-orders - Create order
const createOrderSchema = z.object({
  medicineId: z.string().optional(),
  medicineName: z.string().optional(),
  quantity: z.number().int().positive().min(1).max(1000).default(1),
  deliveryAddress: z.string().max(500).optional(),
  paymentMethod: z.string().max(50).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validated = createOrderSchema.parse(body)

    let medicineId = validated.medicineId

    // If medicine name provided, lookup medicine
    if (!medicineId && validated.medicineName) {
      const medicine = await prisma.medicine.findFirst({
        where: {
          name: { equals: validated.medicineName, mode: "insensitive" }
        }
      })

      if (!medicine) {
        return NextResponse.json(
          { error: "Medicine not found" },
          { status: 404 }
        )
      }

      medicineId = medicine.id
    }

    if (!medicineId) {
      return NextResponse.json(
        { error: "Medicine ID or name is required" },
        { status: 400 }
      )
    }

    // SECURITY: Always fetch current price from database, never trust client
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    })

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      )
    }

    // Check if medicine is in stock
    if (medicine.stock === 'OUT_OF_STOCK') {
      return NextResponse.json(
        { error: "Medicine is currently out of stock" },
        { status: 400 }
      )
    }

    // Get current price from database (prevent price manipulation)
    const pricePerUnit = parseFloat(medicine.price.toString())

    // Calculate total
    const totalAmount = pricePerUnit * validated.quantity

    const order = await prisma.pharmacyOrder.create({
      data: {
        patientId: user!.id,
        medicineId,
        quantity: validated.quantity,
        pricePerUnit,
        totalAmount,
        deliveryAddress: validated.deliveryAddress || user!.address,
        paymentMethod: validated.paymentMethod,
        status: "pending",
        paymentStatus: "pending",
      },
      include: {
        medicine: true,
      }
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error creating pharmacy order:", error)
    return NextResponse.json(
      { error: "Failed to create pharmacy order" },
      { status: 500 }
    )
  }
}
