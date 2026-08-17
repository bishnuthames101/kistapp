'use client';

import { useEffect, useState } from 'react';
import { doctors as doctorsApi, errorMessage, type DoctorSlots } from '@/services/api';

/**
 * Real availability for one doctor on one date.
 *
 * Replaces the hardcoded 10:00-16:00 loop that both booking pages used to
 * render for every doctor on every date. Slots now come from the doctor's
 * actual weekly schedule, with taken ones shown greyed out rather than hidden —
 * "10:00 booked" tells the patient the doctor is real and busy, where an empty
 * list just looks broken.
 *
 * On-call doctors get an explanatory note instead of a timetable, because they
 * genuinely do not keep one.
 */

export type SlotSelection = {
  time: string;
  bookingMode: DoctorSlots['bookingMode'];
};

export default function SlotPicker({
  doctorId,
  date,
  value,
  onChange,
}: {
  /** cuid, slug, or the numeric id used in /doctors/[id] URLs. */
  doctorId: string;
  /** "YYYY-MM-DD" */
  date: string;
  value: string;
  onChange: (selection: SlotSelection) => void;
}) {
  const [data, setData] = useState<DoctorSlots | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doctorId || !date) {
      setData(null);
      return;
    }

    // Guards against a slow earlier request landing after a newer one and
    // showing availability for the wrong date.
    let cancelled = false;

    setLoading(true);
    setError('');

    doctorsApi
      .slots(doctorId, date)
      .then((result) => {
        if (cancelled) return;
        setData(result);
        // An on-call doctor has no time to choose; tell the parent immediately
        // so it can enable its submit button.
        if (result.bookingMode === 'on_call') {
          onChange({ time: '', bookingMode: 'on_call' });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setData(null);
        setError(errorMessage(err, 'Could not load availability'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // `onChange` is intentionally excluded: parents commonly pass an inline
    // arrow, which would re-run this fetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date]);

  if (!doctorId || !date) {
    return (
      <p className="text-sm text-gray-500">
        Choose a doctor and a date to see available times.
      </p>
    );
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading available times...</p>;
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (!data) return null;

  if (data.bookingMode === 'on_call') {
    return (
      <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
        <p className="text-sm text-blue-900 font-medium">On-call appointment</p>
        <p className="text-sm text-blue-800 mt-1">{data.message}</p>
        <p className="text-xs text-blue-700 mt-2">
          Doctor&apos;s usual availability: {data.doctor.scheduleNote}
        </p>
      </div>
    );
  }

  if (data.slots.length === 0) {
    return (
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
        {data.message ?? 'No clinic hours on this day.'} Usual availability:{' '}
        {data.doctor.scheduleNote}
      </p>
    );
  }

  const anyAvailable = data.slots.some((slot) => slot.available);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="group" aria-label="Available times">
        {data.slots.map((slot) => {
          const selected = slot.time === value;
          const title =
            slot.reason === 'booked'
              ? 'Already booked'
              : slot.reason === 'too-soon'
                ? 'Too close to now'
                : undefined;

          return (
            <button
              key={slot.time}
              type="button"
              disabled={!slot.available}
              title={title}
              aria-pressed={selected}
              onClick={() => onChange({ time: slot.time, bookingMode: 'scheduled' })}
              className={`px-2 py-2 text-sm rounded-md border transition-colors ${
                selected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : slot.available
                    ? 'bg-white border-gray-300 text-gray-800 hover:border-blue-500'
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through'
              }`}
            >
              {slot.time}
            </button>
          );
        })}
      </div>

      {!anyAvailable && (
        <p className="text-sm text-amber-700 mt-3">
          Every slot on this date is taken. Please choose another date.
        </p>
      )}
    </div>
  );
}
