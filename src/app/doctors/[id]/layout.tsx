import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { doctors, getDoctorById } from "@/data/doctors";
import { breadcrumbJsonLd, pageMetadata, physicianJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return doctors.map((doctor) => ({ id: String(doctor.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const doctor = getDoctorById(Number(id));

  if (!doctor) {
    return pageMetadata({
      title: "Doctor Not Found",
      description: "This doctor profile is no longer available.",
      path: `/doctors/${id}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${doctor.name} - ${doctor.specialty}`,
    description: `${doctor.name}, ${doctor.specialty} at Kist Poly Clinic, Lalitpur. ${doctor.education}, ${doctor.experience} of experience. NMC No. ${doctor.nmcNumber}. Consultation fee Rs. ${doctor.opdCharge}.`,
    path: `/doctors/${doctor.id}`,
    // Only local images can be used as social cards; remote stock photos are skipped.
    images: doctor.image.startsWith("/") ? [doctor.image] : undefined,
    keywords: [
      doctor.name,
      `${doctor.specialty} Lalitpur`,
      `${doctor.specialty} Nepal`,
      "book doctor appointment Lalitpur",
    ],
  });
}

export default async function DoctorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const doctor = getDoctorById(Number(id));

  if (!doctor) notFound();

  return (
    <>
      <JsonLd
        data={[
          physicianJsonLd({
            name: doctor.name,
            specialty: doctor.specialty,
            image: doctor.image.startsWith("/") ? doctor.image : undefined,
            path: `/doctors/${doctor.id}`,
            opdCharge: doctor.opdCharge,
            education: doctor.education,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Doctors", path: "/doctors" },
            { name: doctor.name, path: `/doctors/${doctor.id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
