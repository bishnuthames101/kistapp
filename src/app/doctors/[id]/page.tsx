'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { doctors } from '@/data/doctors';
import { appointments, errorMessage } from '@/services/api';
import Modal from '@/components/Modal';



export default function DoctorProfile() {
  const params = useParams();
  const id = Number(params.id);
  const doctor = doctors.find((d) => d.id === id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showBooking, setShowBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00'
  ];

  const handleBooking = () => {
    if (!user) {
      showToast('Please login to book an appointment', 'error');
      return;
    }
    setShowBooking(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      showToast('Please select date and time', 'error');
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalConfirmation = async () => {
    if (!doctor) return;
    if (booking) return;

    // This used to show a success toast and never call the API at all, so
    // booking from a doctor profile created nothing.
    setBooking(true);
    try {
      await appointments.create({
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialty,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: `Consultation with ${doctor.name}`,
      });

      showToast('Appointment booked successfully! You can see it in your dashboard.', 'success');
      setShowBooking(false);
      setShowConfirmation(false);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      console.error('Failed to book appointment:', error);
      showToast(errorMessage(error, 'Failed to book appointment'), 'error');
    } finally {
      setBooking(false);
    }
  };

  if (!doctor) {
    return (
      <div className="py-16 bg-gray-50 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Doctor Not Found</h1>
        <Link href="/doctors" className="text-blue-600 hover:text-blue-800">
          View All Doctors
        </Link>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/doctors" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Doctors
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row gap-8">
          <div className="relative w-full md:w-80 h-80 bg-gradient-to-br from-blue-100 to-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{doctor.name}</h1>
            <p className="text-blue-600 text-xl font-semibold mb-4">{doctor.specialty}</p>

            <div className="space-y-2 text-gray-700 mb-6">
              <p><strong>Education:</strong> {doctor.education}</p>
              <p><strong>Experience:</strong> {doctor.experience}</p>
              <p><strong>NMC Number:</strong> {doctor.nmcNumber}</p>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <p>{doctor.schedule}</p>
              </div>
              <p><strong>Consultation Fee:</strong> Rs. {doctor.opdCharge}</p>
            </div>

            <button
              onClick={handleBooking}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 flex items-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        title="Book Appointment"
        labelledBy="booking-title"
      >
        <>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                min={minDate}
                max={maxDateStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBooking(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Continue
              </button>
            </div>
        </>
      </Modal>

      {/* Confirmation Modal */}
<Modal
  open={showConfirmation}
  onClose={() => setShowConfirmation(false)}
  title="Confirm Appointment"
  labelledBy="confirm-title"
>
  <>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Doctor</p>
          <p className="font-medium">{doctor.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Specialty</p>
          <p className="font-medium">{doctor.specialty}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date & Time</p>
          <p className="font-medium">
            {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Consultation Fee</p>
          <p className="font-medium">Rs. {doctor.opdCharge}</p>
        </div>
        <div className="pt-4 border-t">
          <p className="font-medium text-gray-800">Payment</p>
          <p className="text-gray-600">Pay at the clinic on the day of your visit</p>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowConfirmation(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          onClick={handleFinalConfirmation}
          disabled={booking}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-60"
        >
          <Check className="w-4 h-4 mr-2" />
          {booking ? 'Booking…' : 'Confirm Booking'}
        </button>
      </div>
  </>
</Modal>

    </div>
  );
}
