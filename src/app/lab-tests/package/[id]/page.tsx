'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, FileText, ArrowLeft, Check, Calendar, AlertCircle, Shield, Star, Package } from 'lucide-react';
import { testPackages } from '@/data/labTests';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { laboratoryTests } from '@/services/api';

export default function PackageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const pkg = testPackages.find(p => p.id === id);
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showBooking, setShowBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Get tomorrow's date as minimum date for booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Get date 30 days from now as maximum date for booking
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const handleBooking = () => {
    if (!user) {
      showToast('Please login to book a package', 'error');
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
    if (!user || !pkg) {
      showToast('Please login to book a package', 'error');
      return;
    }

    try {
      const formattedTime = selectedTime + ':00';

      // Create one lab test booking for the package
      const testData = {
        testName: pkg.name,
        testDescription: `Package includes: ${pkg.tests.join(', ')}`,
        testDate: selectedDate,
        testTime: formattedTime,
      };

      await laboratoryTests.create(testData);
      showToast('Package booking confirmed successfully!', 'success');
      setShowBooking(false);
      setShowConfirmation(false);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error: any) {
      console.error('Failed to book package:', error);
      let errorMessage = 'Failed to book package';

      if (error.response) {
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (typeof error.response.data === 'object') {
            const errorDetails = Object.entries(error.response.data)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            errorMessage = errorDetails || errorMessage;
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Please login to book a package';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to book this package';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid package booking data';
        }
      }

      showToast(errorMessage, 'error');
    }
  };

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center rounded-xl">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
            <p className="text-gray-600 mb-6">The package you're looking for doesn't exist.</p>
            <Link href="/lab-tests/packages" className="glass-button bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
              Browse All Packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/lab-tests/packages"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Packages
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left: Package Image */}
            <div className="glass-card rounded-xl overflow-hidden shadow-xl">
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="glass px-4 py-2 text-sm font-semibold text-blue-700 rounded-full shadow-lg">
                    {pkg.category}
                  </span>
                </div>
                {/* Rating Badge */}
                <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full shadow-lg">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">4.8</span>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">NABL Certified</p>
                  </div>
                  <div>
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">{pkg.tests.length}+ Tests</p>
                  </div>
                  <div>
                    <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Package Details */}
            <div className="glass-card rounded-xl shadow-xl p-8 bg-white">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{pkg.name}</h1>
              <p className="text-gray-600 mb-6 text-lg">{pkg.description}</p>

              {/* Price */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</span>
                  <span className="text-gray-500 line-through">₹{Math.round(pkg.price * 1.4).toLocaleString()}</span>
                  <span className="text-green-600 font-semibold text-sm bg-green-100 px-2 py-1 rounded">
                    Save {Math.round(((pkg.price * 1.4 - pkg.price) / (pkg.price * 1.4)) * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">All inclusive - No hidden charges</p>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-gray-700">Report Time</p>
                    <p className="text-sm text-gray-600">{pkg.turnaroundTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-gray-700">Requirements</p>
                    <p className="text-sm text-gray-600">{pkg.requirements}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              {pkg.features && pkg.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book This Package Now
              </button>
            </div>
          </div>

          {/* Tests Included Section */}
          <div className="glass-card rounded-xl shadow-xl p-8 bg-white mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Tests Included ({pkg.tests.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pkg.tests.map((test, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{test}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="glass-card rounded-xl shadow-xl p-8 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-600">
                  1
                </div>
                <h3 className="font-semibold mb-2">Book Online</h3>
                <p className="text-sm text-gray-600">Select your package and choose a convenient time slot</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                  2
                </div>
                <h3 className="font-semibold mb-2">Sample Collection</h3>
                <p className="text-sm text-gray-600">Visit our clinic or opt for home sample collection</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-600">
                  3
                </div>
                <h3 className="font-semibold mb-2">Lab Processing</h3>
                <p className="text-sm text-gray-600">Our certified lab processes your samples</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-orange-600">
                  4
                </div>
                <h3 className="font-semibold mb-2">Get Results</h3>
                <p className="text-sm text-gray-600">Receive your detailed reports digitally</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Schedule Your Test</h2>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  min={minDate}
                  max={maxDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Time Slot
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBooking(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Confirm Your Booking</h2>

            <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-semibold text-gray-900">{pkg.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {selectedTime}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">₹{pkg.price.toLocaleString()}</p>
              </div>
              <div className="pt-2">
                <p className="font-semibold text-gray-800">Payment Method</p>
                <p className="text-gray-600">Pay on Visit</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleFinalConfirmation}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
