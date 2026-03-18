'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

const doctors = [
  {
    id: 1,
    name: "Dr. Prabhakar Shah",
    specialty: "Consultant General, Laparoscopic & Laser Surgeon",
    education: "MBBS, MUMS MS (Pakistan)",
    experience: "10+ years",
    image: "/doctors/Prabhakar Shah.jpg",
    schedule: "Time schedule changes every week",
    opdCharge: 800,
    nmcNumber: "8698"
  },
  {
    id: 2,
    name: "Dr. Arbind Sah",
    specialty: "Senior Consultant Physician",
    education: "MBBS, MD (Internal Medicine)",
    experience: "7+ years",
    image: "/doctors/Arbind Sah.jpg",
    schedule: "Sun-Wed: 10AM - 5PM",
    opdCharge: 650,
    nmcNumber: "9037"
  },
  {
    id: 3,
    name: "Dr. Ranjit Sah",
    specialty: "Consultant Orthopedic Surgeon",
    education: "MBBS (KU), MS Orthopedic (KEMU, Pakistan)",
    experience: "7+ years",
    image: "/doctors/Ranjit Sah.jpg",
    schedule: "Mon-Fri: 11AM - 2PM",
    opdCharge: 650,
    nmcNumber: "10861"
  },
  {
    id: 4,
    name: "Dr. Bibek Joshi",
    specialty: "Radiologist, USG Specialist",
    education: "MBBS, MD (Radiology)",
    experience: "20+ years",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400",
    schedule: "On call appointment (except Saturday)",
    opdCharge: 650,
    nmcNumber: "623"
  },
  {
    id: 5,
    name: "Dr. Ram Krishna Giri",
    specialty: "Consultant Immunologist and Rheumatologist",
    education: "MBBS, MD, FCIR",
    experience: "10+ years",
    image: "/doctors/Ram Krishna Giri.jpg",
    schedule: "Every third Saturday of each month",
    opdCharge: 800,
    nmcNumber: "6728"
  },
  {
    id: 6,
    name: "Dr. Laxman Kuwar",
    specialty: "Radiologist, X-ray Reporting Specialist",
    education: "MBBS, MD (Radiology)",
    experience: "20+ years",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    schedule: "On call appointment",
    opdCharge: 650,
    nmcNumber: "2568"
  },
  {
    id: 7,
    name: "Dr. Sukhesh Purush Dhakal",
    specialty: "Senior Consultant Physician & Endocrinologist (Sugar and Thyroid Specialist)",
    education: "MBBS, MD (HONS) Internal Medicine, Member ACP USA",
    experience: "10+ years",
    image: "/doctors/Sukhesh Purush Dhakal.jpg",
    schedule: "On call appointment",
    opdCharge: 800,
    nmcNumber: "8216"
  },
  {
    id: 8,
    name: "Dr. Jitendra Singh",
    specialty: "Obstetrician & Gynecologist, Laparoscopic Surgeon, Infertility Specialist",
    education: "MBBS (TU), MD (NAMS, BIR Hospital)",
    experience: "5+ years",
    image: "/doctors/Jitendra Singh.jpg",
    schedule: "On call appointment",
    opdCharge: 825,
    nmcNumber: "16819"
  },
  {
    id: 9,
    name: "Dr. Jitendra Prasad Yadav",
    specialty: "Senior Consultant Physician & Neurologist",
    education: "MBBS, MD, FICN",
    experience: "10+ years",
    image: "/doctors/Jitendra Prasad Yadav.jpg",
    schedule: "On call appointment",
    opdCharge: 800,
    nmcNumber: "8029"
  }
];

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

  const handleFinalConfirmation = () => {
    showToast('Appointment booked successfully!', 'success');
    setShowBooking(false);
    setShowConfirmation(false);
    setSelectedDate('');
    setSelectedTime('');
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
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl pointer-events-auto">
            <h2 className="text-2xl font-bold mb-6">Book Appointment</h2>

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
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
{showConfirmation && (
  <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl pointer-events-auto">
      <h2 className="text-2xl font-bold mb-6">Confirm Appointment</h2>

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
          <p className="font-medium text-gray-800">Payment Method</p>
          <p className="text-gray-600">Cash on Delivery</p>
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
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirm Booking
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
