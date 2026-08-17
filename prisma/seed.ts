/**
 * Mirrors src/data/doctors.ts into the `doctors` / `doctor_schedules` tables.
 *
 * That file stays the content source: it drives static generation of the
 * marketing pages, so keeping it authoritative avoids turning nine prerendered
 * pages into runtime database reads. This table is the authority for *booking*
 * only — availability, conflict detection and the fee attached to an
 * appointment.
 *
 * Idempotent: safe to re-run after editing doctors.ts.
 *
 *   npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import { doctors } from "../src/data/doctors";
import { timeToMinutes } from "../src/lib/slots";

config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log(`Seeding ${doctors.length} doctors...`);

  for (const doctor of doctors) {
    const record = await prisma.doctor.upsert({
      where: { slug: doctor.slug },
      create: {
        slug: doctor.slug,
        legacyId: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        education: doctor.education,
        experience: doctor.experience,
        image: doctor.image,
        scheduleNote: doctor.schedule,
        opdCharge: doctor.opdCharge,
        nmcNumber: doctor.nmcNumber,
        bookingMode: doctor.bookingMode,
        slotDurationMinutes: doctor.slotDurationMinutes,
        isActive: true,
      },
      update: {
        legacyId: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        education: doctor.education,
        experience: doctor.experience,
        image: doctor.image,
        scheduleNote: doctor.schedule,
        opdCharge: doctor.opdCharge,
        nmcNumber: doctor.nmcNumber,
        bookingMode: doctor.bookingMode,
        slotDurationMinutes: doctor.slotDurationMinutes,
        isActive: true,
      },
    });

    // Replace the whole weekly schedule rather than diffing it: it is at most a
    // handful of rows, and this makes removing a day work correctly.
    await prisma.doctorSchedule.deleteMany({ where: { doctorId: record.id } });

    if (doctor.availability.length > 0) {
      await prisma.doctorSchedule.createMany({
        data: doctor.availability.map((window) => ({
          doctorId: record.id,
          dayOfWeek: window.dayOfWeek,
          startMinute: timeToMinutes(window.start),
          endMinute: timeToMinutes(window.end),
        })),
      });
    }

    const windows = doctor.availability.length;
    console.log(
      `  ${doctor.name} (${doctor.bookingMode})` +
        (windows ? ` - ${windows} weekly window(s)` : "")
    );
  }

  // Backfill: appointments booked before this table existed reference a doctor
  // only by name. Match them up so historical records join correctly.
  let linked = 0;
  for (const doctor of doctors) {
    const { count } = await prisma.appointment.updateMany({
      where: { doctorId: null, doctorName: doctor.name },
      data: { doctorId: (await prisma.doctor.findUniqueOrThrow({
        where: { slug: doctor.slug },
        select: { id: true },
      })).id },
    });
    linked += count;
  }

  const orphaned = await prisma.appointment.count({ where: { doctorId: null } });

  console.log(`\nLinked ${linked} existing appointment(s) to a doctor.`);
  if (orphaned > 0) {
    console.warn(
      `${orphaned} appointment(s) still have no doctor — their doctorName does ` +
        `not match any doctor in src/data/doctors.ts. They are kept as-is.`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
