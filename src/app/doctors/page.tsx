import { Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Our Doctors - KIST Poly Clinic',
  description: 'Meet our team of experienced medical professionals.',
};

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

export default function DoctorsPage() {
  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
