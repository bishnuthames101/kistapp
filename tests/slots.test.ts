import { describe, it, expect } from "vitest";
import {
  generateSlotsForDay,
  getSlotAvailability,
  minutesToTime,
  parseDateKey,
  timeToMinutes,
  toDateKey,
  validateAppointmentDate,
  type ScheduleWindow,
} from "@/lib/slots";

/**
 * Booking was previously "theatre": a hardcoded 10:00-16:00 loop for every
 * doctor on every date, with no conflict detection. These tests pin down the
 * replacement.
 */

// Dr. Arbind Sah: Sun-Wed 10:00-17:00.
const SUN_TO_WED: ScheduleWindow[] = [0, 1, 2, 3].map((dayOfWeek) => ({
  dayOfWeek,
  startMinute: 600, // 10:00
  endMinute: 1020, // 17:00
}));

describe("time conversion", () => {
  it("round-trips", () => {
    for (const time of ["00:00", "09:05", "10:30", "23:59"]) {
      expect(minutesToTime(timeToMinutes(time))).toBe(time);
    }
  });

  it("pads single-digit hours", () => {
    expect(minutesToTime(timeToMinutes("9:05"))).toBe("09:05");
  });

  it("rejects nonsense", () => {
    for (const bad of ["", "25:00", "10:60", "abc", "10", "10:5"]) {
      expect(() => timeToMinutes(bad)).toThrow();
    }
  });
});

describe("parseDateKey", () => {
  it("parses to LOCAL midnight, not UTC", () => {
    // `new Date("2026-08-10")` is UTC midnight, which is 9 August anywhere
    // west of Greenwich and shifts Nepal (UTC+5:45) at the boundary.
    const date = parseDateKey("2026-08-10")!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(10);
    expect(date.getHours()).toBe(0);
  });

  it("rejects malformed and impossible dates", () => {
    for (const bad of ["2026-8-10", "10-08-2026", "2026-02-30", "2026-13-01", ""]) {
      expect(parseDateKey(bad)).toBeNull();
    }
  });

  it("round-trips with toDateKey", () => {
    expect(toDateKey(parseDateKey("2026-03-01")!)).toBe("2026-03-01");
  });
});

describe("generateSlotsForDay", () => {
  it("only emits slots that fit entirely inside the window", () => {
    // 10:00-17:00 in 30-minute slots ends at 16:30, not 17:00 — a 17:00 slot
    // would run to 17:30, past the end of the doctor's hours.
    const slots = generateSlotsForDay(SUN_TO_WED, 0, 30);
    expect(slots[0]).toBe("10:00");
    expect(slots.at(-1)).toBe("16:30");
    expect(slots).toHaveLength(14);
    expect(slots).not.toContain("17:00");
  });

  it("returns nothing on a day the doctor does not work", () => {
    // Thursday, Friday, Saturday.
    for (const day of [4, 5, 6]) {
      expect(generateSlotsForDay(SUN_TO_WED, day, 30)).toEqual([]);
    }
  });

  it("respects a different slot duration", () => {
    // Dr. Ranjit Sah: 11:00-14:00 in 20-minute slots.
    const windows: ScheduleWindow[] = [{ dayOfWeek: 1, startMinute: 660, endMinute: 840 }];
    const slots = generateSlotsForDay(windows, 1, 20);
    expect(slots).toHaveLength(9);
    expect(slots[0]).toBe("11:00");
    expect(slots.at(-1)).toBe("13:40");
  });

  it("de-duplicates overlapping windows and stays sorted", () => {
    const windows: ScheduleWindow[] = [
      { dayOfWeek: 1, startMinute: 600, endMinute: 720 },
      { dayOfWeek: 1, startMinute: 660, endMinute: 780 },
    ];
    const slots = generateSlotsForDay(windows, 1, 30);
    expect(slots).toEqual(["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]);
    expect([...slots].sort()).toEqual(slots);
  });

  it("returns nothing for a non-positive duration instead of looping forever", () => {
    expect(generateSlotsForDay(SUN_TO_WED, 0, 0)).toEqual([]);
    expect(generateSlotsForDay(SUN_TO_WED, 0, -30)).toEqual([]);
  });
});

describe("getSlotAvailability", () => {
  // 2026-08-16 is a Sunday.
  const sunday = new Date(2026, 7, 16);

  it("marks booked slots unavailable but still lists them", () => {
    const slots = getSlotAvailability({
      windows: SUN_TO_WED,
      slotDurationMinutes: 30,
      date: sunday,
      bookedTimes: ["10:00", "11:30"],
      now: new Date(2026, 7, 10, 9, 0),
    });

    // A greyed-out "10:00 booked" reads as a busy doctor; hiding it reads as
    // a clinic with no hours.
    expect(slots).toHaveLength(14);

    const ten = slots.find((slot) => slot.time === "10:00")!;
    expect(ten.available).toBe(false);
    expect(ten.reason).toBe("booked");

    expect(slots.find((slot) => slot.time === "10:30")!.available).toBe(true);
  });

  it("hides same-day slots inside the lead time", () => {
    // It is 12:00 on the day itself, lead time 60 minutes.
    const slots = getSlotAvailability({
      windows: SUN_TO_WED,
      slotDurationMinutes: 30,
      date: sunday,
      bookedTimes: [],
      now: new Date(2026, 7, 16, 12, 0),
      minLeadMinutes: 60,
    });

    expect(slots.find((slot) => slot.time === "12:30")!.reason).toBe("too-soon");
    // Exactly 60 minutes away is allowed.
    expect(slots.find((slot) => slot.time === "13:00")!.available).toBe(true);
    expect(slots.find((slot) => slot.time === "14:00")!.available).toBe(true);
  });

  it("does not apply the lead time to a future date", () => {
    const slots = getSlotAvailability({
      windows: SUN_TO_WED,
      slotDurationMinutes: 30,
      date: sunday,
      bookedTimes: [],
      // A week earlier, late in the day: nothing should be "too soon".
      now: new Date(2026, 7, 9, 23, 30),
    });

    expect(slots.every((slot) => slot.available)).toBe(true);
  });

  it("returns nothing on a day with no schedule", () => {
    const saturday = new Date(2026, 7, 22);
    expect(
      getSlotAvailability({
        windows: SUN_TO_WED,
        slotDurationMinutes: 30,
        date: saturday,
        bookedTimes: [],
        now: new Date(2026, 7, 10),
      })
    ).toEqual([]);
  });
});

describe("validateAppointmentDate", () => {
  const now = new Date(2026, 7, 10, 12, 0);

  it("accepts today", () => {
    const result = validateAppointmentDate("2026-08-10", now);
    expect(result.ok).toBe(true);
  });

  it("rejects yesterday", () => {
    const result = validateAppointmentDate("2026-08-09", now);
    expect(result).toMatchObject({ ok: false });
  });

  it("rejects a date beyond the booking horizon", () => {
    expect(validateAppointmentDate("2026-10-10", now, 60)).toMatchObject({ ok: false });
    // The last allowed day is inclusive.
    expect(validateAppointmentDate("2026-10-09", now, 60).ok).toBe(true);
  });

  it("rejects malformed input", () => {
    expect(validateAppointmentDate("not-a-date", now)).toMatchObject({ ok: false });
  });
});
