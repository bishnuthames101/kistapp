export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  education: string;
  experience: string;
  image: string;
  schedule: string;
  opdCharge: number;
  nmcNumber: string;
}

export const doctors: Doctor[] = [
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

export const getDoctorById = (id: number) =>
  doctors.find((doctor) => doctor.id === id);
