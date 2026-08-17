import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { findDoctorByAnyId, SLOT_HOLDING_STATUSES } from "@/lib/doctors"
import { toNumber } from "@/lib/serialize"
import { getSlotAvailability, validateAppointmentDate } from "@/lib/slots"

/**
 * GET /api/doctors/[id]/slots?date=YYYY-MM-DD
 *
 * The real availability for one doctor on one date. Replaces the client-side
 * loop that invented 10:00-16:00 for every doctor on every day.
 *
 * For `on_call` doctors this deliberately returns an empty slot list with
 * `bookingMode: "on_call"`, so the UI asks for a preferred date instead of
 * showing a timetable the clinic does not keep.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get("date")

    if (!dateParam) {
      return NextResponse.json(
        { error: "A date query parameter is required (YYYY-MM-DD)" },
        { status: 400 }
      )
    }

    const dateCheck = validateAppointmentDate(dateParam)
    if (!dateCheck.ok) {
      return NextResponse.json({ error: dateCheck.error }, { status: 400 })
    }

    const doctor = await findDoctorByAnyId(id)

    if (!doctor || !doctor.isActive) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const base = {
      doctor: {
        id: doctor.id,
        slug: doctor.slug,
        name: doctor.name,
        specialty: doctor.specialty,
        opdCharge: toNumber(doctor.opdCharge),
        scheduleNote: doctor.scheduleNote,
      },
      date: dateParam,
      bookingMode: doctor.bookingMode,
    }

    if (doctor.bookingMode === "on_call") {
      return NextResponse.json({
        ...base,
        slots: [],
        message:
          "This doctor sees patients on call. Submit a request with your preferred date and the clinic will confirm a time with you.",
      })
    }

    // Only live appointments hold a slot, matching the partial unique index in
    // the migration — a cancelled 10:00 must become bookable again.
    const taken = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        appointmentDate: dateCheck.date,
        status: { in: [...SLOT_HOLDING_STATUSES] },
      },
      select: { appointmentTime: true },
    })

    const slots = getSlotAvailability({
      windows: doctor.schedules,
      slotDurationMinutes: doctor.slotDurationMinutes,
      date: dateCheck.date,
      bookedTimes: taken.map((appointment) => appointment.appointmentTime),
    })

    return NextResponse.json({
      ...base,
      slots,
      message:
        slots.length === 0
          ? "This doctor has no clinic hours on the selected day. Please choose another date."
          : undefined,
    })
  } catch (error) {
    console.error("Error fetching doctor slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}
