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
