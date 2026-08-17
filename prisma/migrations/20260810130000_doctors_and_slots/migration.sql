-- CreateEnum
CREATE TYPE "DoctorBookingMode" AS ENUM ('scheduled', 'on_call');

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legacy_id" INTEGER,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "image" TEXT,
    "schedule_note" TEXT NOT NULL,
    "opd_charge" DECIMAL(10,2) NOT NULL,
    "nmc_number" TEXT NOT NULL,
    "booking_mode" "DoctorBookingMode" NOT NULL DEFAULT 'on_call',
    "slot_duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedules" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,

    CONSTRAINT "doctor_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_slug_key" ON "doctors"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_legacy_id_key" ON "doctors"("legacy_id");

-- CreateIndex
CREATE INDEX "doctors_is_active_idx" ON "doctors"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_doctor_id_day_of_week_start_minute_key" ON "doctor_schedules"("doctor_id", "day_of_week", "start_minute");

-- CreateIndex
CREATE INDEX "doctor_schedules_doctor_id_day_of_week_idx" ON "doctor_schedules"("doctor_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: link appointments to a doctor and remember the agreed fee.
-- Both are nullable so existing rows survive; prisma/seed.ts backfills
-- doctor_id by matching the stored doctor_name.
ALTER TABLE "appointments" ADD COLUMN "doctor_id" TEXT;
ALTER TABLE "appointments" ADD COLUMN "opd_charge" DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "appointments_doctor_id_appointment_date_idx" ON "appointments"("doctor_id", "appointment_date");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- The actual double-booking fix.
--
-- Until now nothing stopped fifty patients booking the same doctor at the same
-- time; every one of them got "booked successfully". The application also
-- checks availability, but only a database constraint can win the race between
-- two simultaneous requests.
--
-- PARTIAL, for two reasons:
--   - cancelled and completed appointments must not reserve the slot forever,
--     otherwise a cancelled 10:00 can never be rebooked;
--   - on-call requests have no time yet (appointment_time = ''), and any number
--     of those may be pending for the same doctor and date.
--
-- Prisma cannot express a partial unique index, so this is raw SQL and does not
-- appear in schema.prisma. See the NOTE on model Appointment.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX "appointments_doctor_slot_unique"
    ON "appointments" ("doctor_id", "appointment_date", "appointment_time")
    WHERE "doctor_id" IS NOT NULL
      AND "appointment_time" <> ''
      AND "status" IN ('pending', 'confirmed');
