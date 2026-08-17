import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { paginated, readPageParams, toNumber } from "@/lib/serialize"
import { minutesToTime } from "@/lib/slots"

/**
 * GET /api/doctors — the bookable doctor list.
 *
 * Public: this is the same information already published on /doctors, and the
 * booking UI needs it before the patient has logged in.
 */
export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = readPageParams(req.url)

    const where = { isActive: true }

    const [doctors, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        orderBy: { name: "asc" },
        include: {
          schedules: {
            orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
          },
        },
        skip,
        take: limit,
      }),
      prisma.doctor.count({ where }),
    ])

    return NextResponse.json(
      paginated(
        doctors.map((doctor) => ({
          id: doctor.id,
          slug: doctor.slug,
          legacyId: doctor.legacyId,
          name: doctor.name,
          specialty: doctor.specialty,
          education: doctor.education,
          experience: doctor.experience,
          image: doctor.image,
          scheduleNote: doctor.scheduleNote,
          opdCharge: toNumber(doctor.opdCharge),
          nmcNumber: doctor.nmcNumber,
          bookingMode: doctor.bookingMode,
          slotDurationMinutes: doctor.slotDurationMinutes,
          availability: doctor.schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            start: minutesToTime(schedule.startMinute),
            end: minutesToTime(schedule.endMinute),
          })),
        })),
        total,
        page,
        limit
      )
    )
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}
