'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/data/services';
import { Calendar, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { appointments, errorMessage } from '@/services/api';
import Modal from '@/components/Modal';
import SlotPicker, { type SlotSelection } from '@/components/SlotPicker';

export default function ServiceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const service = services.find(s => s.id === id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  // On-call doctors have no slot to pick, so "no time chosen" is valid for them
  // but not for a scheduled doctor.
  const [bookingMode, setBookingMode] = useState<SlotSelection['bookingMode'] | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSlotChange = (selection: SlotSelection) => {
    setSelectedTime(selection.time);
    setBookingMode(selection.bookingMode);
  };

  // Get tomorrow's date as minimum date for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get date 30 days from now as maximum date for booking
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleBooking = () => {
    if (!user) {
      showToast('Please login to book an appointment', 'error');
      return;
    }
    setShowBooking(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !selectedDate) {
      showToast('Please choose a doctor and a date', 'error');
      return;
    }
    // A scheduled doctor needs an actual slot; an on-call one has none to give.
    if (bookingMode === 'scheduled' && !selectedTime) {
      showToast('Please choose an appointment time', 'error');
      return;
    }
    if (!bookingMode) {
      showToast('Still loading availability. Please wait a moment.', 'error');
      return;
    }
    setShowConfirmation(true);
  };

  const handleFinalConfirmation = async () => {
    if (submitting) return;

    try {
      if (!service) {
        showToast('Service not found', 'error');
        return;
      }

      setSubmitting(true);

      // The server reads the doctor's name, specialty and fee from the doctor
      // record; sending them from here would let the two disagree.
      await appointments.create({
        doctorId: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime || undefined,
        reason: `Appointment for ${service.name} service`,
      });

      showToast(
        bookingMode === 'on_call'
          ? 'Request sent. The clinic will call you to confirm a time.'
          : 'Appointment booked successfully! You can see it in your dashboard.',
        'success'
      );
      setShowBooking(false);
      setShowConfirmation(false);
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setBookingMode(null);
    } catch (error) {
      console.error('Failed to book appointment:', error);
      // A 409 here means someone took the slot between loading it and
      // confirming. Send the patient back to pick again rather than leaving
      // them on a dead confirmation screen.
      setShowConfirmation(false);
      showToast(errorMessage(error, 'Failed to book appointment'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <Link href="/services" className="text-blue-600 hover:text-blue-800">
            View All Services
          </Link>
        </div>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
        <Link
            href="/services"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Services
          </Link>
          {/* Service Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
              <div className="flex items-center">
                <Icon className="w-12 h-12 text-blue-600 mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{service.name}</h1>
                  <p className="text-xl text-blue-600 font-semibold mt-2">Rs. {service.price}</p>
                </div>
              </div>
              <button
                onClick={handleBooking}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center w-full sm:w-auto"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
            </div>
            <p className="text-gray-600 text-lg">{service.longDescription}</p>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctors */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Specialists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center space-x-4">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-gray-600">{doctor.specialty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {service.faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
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
            {/* Doctor Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => {
                  setSelectedDoctor(e.target.value);
                  // Availability is per doctor, so any held selection is stale.
                  setSelectedTime('');
                  setBookingMode(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a doctor</option>
                {service.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                min={minDate}
                max={maxDateStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                  setBookingMode(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Time Selection - real availability for this doctor and date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <SlotPicker
                doctorId={selectedDoctor}
                date={selectedDate}
                value={selectedTime}
                onChange={handleSlotChange}
              />
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
                <p className="text-sm text-gray-600">Service</p>
                <p className="font-medium">{service.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Doctor</p>
                <p className="font-medium">
                  {service.doctors.find(d => d.id === selectedDoctor)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date &amp; Time</p>
                <p className="font-medium">
                  {new Date(selectedDate).toLocaleDateString()}
                  {selectedTime ? ` at ${selectedTime}` : ''}
                </p>
                {bookingMode === 'on_call' && (
                  <p className="text-sm text-blue-700 mt-1">
                    This doctor sees patients on call — the clinic will call you
                    to confirm an exact time.
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium">Rs. {service.price}</p>
              </div>
              <div className="pt-4 border-t">
                <p className="font-medium text-gray-800">Payment Method</p>
                <p className="text-gray-600">Pay on Visit</p>
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
                disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 mr-2" />
                {submitting
                  ? 'Booking...'
                  : bookingMode === 'on_call'
                    ? 'Send Request'
                    : 'Confirm Booking'}
              </button>
            </div>
        </>
      </Modal>
    </div>
  );
}
