import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { findDoctorByAnyId, SLOT_HOLDING_STATUSES } from "@/lib/doctors"
import { paginated, toDateOnly, toNumber } from "@/lib/serialize"
import { getSlotAvailability, validateAppointmentDate } from "@/lib/slots"
import { z } from "zod"

/** Money as a number and the date column as "YYYY-MM-DD", as everywhere else. */
function serializeAppointment<
  T extends { appointmentDate: Date | string; opdCharge?: Prisma.Decimal | number | null }
>(appointment: T) {
  return {
    ...appointment,
    appointmentDate: toDateOnly(appointment.appointmentDate),
    opdCharge: appointment.opdCharge == null ? null : toNumber(appointment.opdCharge),
  }
}

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

    return NextResponse.json(
      paginated(appointments.map(serializeAppointment), total, page, limit)
    )
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

// POST /api/appointments - Create appointment
//
// `doctorId` is what actually identifies the doctor. The name and
// specialization are no longer accepted from the client: they are read from
// the Doctor row and stored as a snapshot, so a patient cannot book "Dr.
// Whoever" and the record cannot disagree with the doctor it points at.
const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Please choose a doctor"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  /** Omitted or empty for on-call doctors, where the clinic sets the time. */
  appointmentTime: z.string().optional(),
  reason: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validated = createAppointmentSchema.parse(body)

    const dateCheck = validateAppointmentDate(validated.appointmentDate)
    if (!dateCheck.ok) {
      return NextResponse.json({ error: dateCheck.error }, { status: 400 })
    }
    const appointmentDate = dateCheck.date

    const doctor = await findDoctorByAnyId(validated.doctorId)
    if (!doctor || !doctor.isActive) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    let appointmentTime = (validated.appointmentTime ?? "").trim()

    if (doctor.bookingMode === "on_call") {
      // No timetable exists for these doctors, so any time the client sends is
      // made up. Store the request without one; the clinic fills it in when it
      // confirms.
      appointmentTime = ""
    } else {
      if (!appointmentTime) {
        return NextResponse.json(
          { error: "Please choose an appointment time" },
          { status: 400 }
        )
      }

      // Re-derive availability server-side. The client already filtered the
      // list, but that is a convenience, not a control.
      const taken = await prisma.appointment.findMany({
        where: {
          doctorId: doctor.id,
          appointmentDate,
          status: { in: [...SLOT_HOLDING_STATUSES] },
        },
        select: { appointmentTime: true },
      })

      const slot = getSlotAvailability({
        windows: doctor.schedules,
        slotDurationMinutes: doctor.slotDurationMinutes,
        date: appointmentDate,
        bookedTimes: taken.map((appointment) => appointment.appointmentTime),
      }).find((candidate) => candidate.time === appointmentTime)

      if (!slot) {
        return NextResponse.json(
          { error: "That time is not part of this doctor's schedule" },
          { status: 400 }
        )
      }

      if (!slot.available) {
        return NextResponse.json(
          {
            error:
              slot.reason === "booked"
                ? "That slot has just been taken. Please choose another time."
                : "That slot is too close to now. Please choose a later time.",
          },
          { status: 409 }
        )
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: user!.id,
        doctorId: doctor.id,
        // Snapshots, so the record still reads correctly if the doctor is
        // later renamed or changes specialty.
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialty,
        opdCharge: doctor.opdCharge,
        appointmentDate,
        appointmentTime,
        reason: validated.reason,
        notes: validated.notes,
        status: "pending",
      },
    })

    return NextResponse.json(serializeAppointment(appointment), { status: 201 })
  } catch (error) {
    // The partial unique index on (doctor, date, time) is what actually
    // prevents double-booking: two requests can both pass the availability
    // check above and only one can win here.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That slot has just been taken. Please choose another time." },
        { status: 409 }
      )
    }

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
