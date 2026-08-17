import { prisma } from "@/lib/prisma"

/**
 * Resolves the doctor identifier that appears in a URL.
 *
 * The marketing pages route on the numeric id from src/data/doctors.ts
 * (/doctors/2), which is stored as `legacyId`. API clients may reasonably use
 * the cuid or the slug. Accepting all three keeps existing links — and their
 * accumulated SEO — working without a redirect layer.
 */
export async function findDoctorByAnyId(identifier: string) {
  const numeric = /^\d+$/.test(identifier) ? Number(identifier) : null

  return prisma.doctor.findFirst({
    where: {
      OR: [
        { id: identifier },
        { slug: identifier },
        ...(numeric !== null ? [{ legacyId: numeric }] : []),
      ],
    },
    include: {
      schedules: {
        orderBy: [{ dayOfWeek: "asc" }, { startMinute: "asc" }],
      },
    },
  })
}

/** Statuses that hold a slot. Cancelled and completed ones release it. */
export const SLOT_HOLDING_STATUSES = ["pending", "confirmed"] as const
