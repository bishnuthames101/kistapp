import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

// GET /api/appointments - Get appointments (all for admin, user's for patients)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    // If admin, return all appointments with patient details
    // If patient, return only their appointments
    const whereClause = user!.role === 'admin'
      ? {}
      : { patientId: user!.id }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: whereClause,
        orderBy: [
          { appointmentDate: "desc" },
          { appointmentTime: "desc" },
        ],
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.appointment.count({ where: whereClause }),
    ])

    return NextResponse.json({
      data: appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create appointment
const createAppointmentSchema = z.object({
  doctorName: z.string().min(1, "Doctor name is required"),
  doctorSpecialization: z.string().min(1, "Specialization is required"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  appointmentTime: z.string().min(1, "Time is required"),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validated = createAppointmentSchema.parse(body)

    // Check if appointment date is not in the past
    const appointmentDate = new Date(validated.appointmentDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (appointmentDate < today) {
      return NextResponse.json(
        { error: "Appointment date cannot be in the past" },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        ...validated,
        appointmentDate,
        patientId: user!.id,
        status: "pending",
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error creating appointment:", error)
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    )
  }
}
