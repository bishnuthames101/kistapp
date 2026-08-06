import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { doctors } from '@/data/doctors';

import JsonLd from '@/components/JsonLd';
import { absoluteUrl, breadcrumbJsonLd, pageMetadata, physicianJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Our Doctors',
  description:
    'Meet the doctors at KIST Poly Clinic, Lalitpur - physicians, surgeons, orthopedic, gynecology, neurology, endocrinology and radiology specialists. View schedules and consultation fees.',
  path: '/doctors',
  keywords: ['doctors in Lalitpur', 'best physician Lalitpur', 'specialist doctor Nepal', 'NMC registered doctors'],
});



export default function DoctorsPage() {
  // An ItemList of Physician entities so each doctor is discoverable from the
  // roster page, not only from their own profile.
  const doctorListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Doctors at KIST Poly Clinic',
    itemListElement: doctors.map((doctor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/doctors/${doctor.id}`),
      item: physicianJsonLd({
        name: doctor.name,
        specialty: doctor.specialty,
        image: doctor.image.startsWith('/') ? doctor.image : undefined,
        path: `/doctors/${doctor.id}`,
        opdCharge: doctor.opdCharge,
        education: doctor.education,
      }),
    })),
  };

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <JsonLd
        data={[
          doctorListJsonLd,
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Doctors', path: '/doctors' },
          ]),
        ]}
      />
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="glass-card inline-block p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Medical Team</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet our team of experienced and dedicated medical professionals committed to providing you with the highest quality healthcare.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="glass-card hover:bg-white/30 transition-all duration-300 overflow-hidden">
              <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-gray-100">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">{doctor.name}</h2>
                <p className="text-blue-600 font-semibold mb-4">{doctor.specialty}</p>

                <div className="space-y-3 text-gray-600">
                  <p><strong>Education:</strong> {doctor.education}</p>
                  <p><strong>Experience:</strong> {doctor.experience}</p>
                  <p><strong>NMC Number:</strong> {doctor.nmcNumber}</p>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <p>{doctor.schedule}</p>
                  </div>
                  <p><strong>Consultation Fee:</strong> Rs. {doctor.opdCharge}</p>
                </div>

                <div className="mt-6">
                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="glass-button w-full flex items-center justify-center"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
