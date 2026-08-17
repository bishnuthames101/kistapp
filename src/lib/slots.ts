/**
 * Appointment slot arithmetic.
 *
 * Deliberately pure and database-free: this is the logic that decides whether a
 * patient can be told "10:30 is available", and it is the part that was
 * previously a five-line hardcoded loop generating 10:00-16:00 for every doctor
 * on every date. Keeping it here means it can be unit-tested exhaustively
 * without a database.
 */

/** A recurring weekly window, in minutes from midnight. */
export type ScheduleWindow = {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
};

/** How far ahead a patient may book. */
export const MAX_BOOKING_DAYS_AHEAD = 60;

/**
 * A same-day slot must be at least this far away. Booking 10:00 at 09:58 gives
 * neither the patient time to travel nor the desk time to notice.
 */
export const MIN_LEAD_MINUTES = 60;

export function timeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) throw new Error(`Invalid time: ${time}`);

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours > 23 || minutes > 59) throw new Error(`Invalid time: ${time}`);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** "YYYY-MM-DD" for a date, in local terms — never shifted by a timezone. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses "YYYY-MM-DD" into a local midnight Date.
 *
 * `new Date("2026-08-10")` parses as UTC midnight, which is the previous day
 * anywhere west of Greenwich and shifts Nepal (UTC+5:45) by a full day at the
 * boundary. This avoids that entirely.
 */
export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  // Rejects 2026-02-30, which would otherwise roll over into March.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Every slot start time a doctor's schedule produces for one weekday,
 * regardless of what is already booked.
 *
 * A slot must fit entirely inside the window: a 10:00-17:00 window with
 * 30-minute slots yields 10:00 ... 16:30, not 17:00.
 */
export function generateSlotsForDay(
  windows: ScheduleWindow[],
  dayOfWeek: number,
  slotDurationMinutes: number
): string[] {
  if (slotDurationMinutes <= 0) return [];

  const slots = new Set<number>();

  for (const window of windows) {
    if (window.dayOfWeek !== dayOfWeek) continue;

    for (
      let minute = window.startMinute;
      minute + slotDurationMinutes <= window.endMinute;
      minute += slotDurationMinutes
    ) {
      slots.add(minute);
    }
  }

  return [...slots].sort((a, b) => a - b).map(minutesToTime);
}

export type SlotAvailability = {
  time: string;
  available: boolean;
  /** Why it cannot be booked. Undefined when `available` is true. */
  reason?: "booked" | "too-soon";
};

/**
 * The bookable picture for one doctor on one date.
 *
 * Returns every slot the schedule defines, each flagged, rather than only the
 * free ones — a greyed-out "10:00 booked" tells the patient the doctor is real
 * and busy, where an absent row just looks like the clinic has no hours.
 */
export function getSlotAvailability(params: {
  windows: ScheduleWindow[];
  slotDurationMinutes: number;
  date: Date;
  bookedTimes: Iterable<string>;
  now?: Date;
  minLeadMinutes?: number;
}): SlotAvailability[] {
  const {
    windows,
    slotDurationMinutes,
    date,
    bookedTimes,
    now = new Date(),
    minLeadMinutes = MIN_LEAD_MINUTES,
  } = params;

  const booked = new Set(bookedTimes);
  const slots = generateSlotsForDay(windows, date.getDay(), slotDurationMinutes);

  const isToday = toDateKey(date) === toDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return slots.map((time) => {
    if (booked.has(time)) {
      return { time, available: false, reason: "booked" as const };
    }

    if (isToday && timeToMinutes(time) - nowMinutes < minLeadMinutes) {
      return { time, available: false, reason: "too-soon" as const };
    }

    return { time, available: true };
  });
}

export type DateRangeCheck =
  | { ok: true; date: Date }
  | { ok: false; error: string };

/**
 * Validates a requested appointment date: well-formed, not in the past, and
 * not absurdly far ahead.
 *
 * The old check did `new Date(dateString) < today`, which compared a UTC
 * midnight against a local midnight and let yesterday through in some
 * timezones.
 */
export function validateAppointmentDate(
  dateKey: string,
  now: Date = new Date(),
  maxDaysAhead: number = MAX_BOOKING_DAYS_AHEAD
): DateRangeCheck {
  const date = parseDateKey(dateKey);
  if (!date) return { ok: false, error: "Invalid date format. Use YYYY-MM-DD." };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (date.getTime() < today.getTime()) {
    return { ok: false, error: "Appointment date cannot be in the past" };
  }

  const latest = new Date(today);
  latest.setDate(latest.getDate() + maxDaysAhead);

  if (date.getTime() > latest.getTime()) {
    return {
      ok: false,
      error: `Appointments can only be booked up to ${maxDaysAhead} days ahead`,
    };
  }

  return { ok: true, date };
}
