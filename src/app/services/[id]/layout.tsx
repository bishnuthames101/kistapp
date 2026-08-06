import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  pageMetadata,
  serviceJsonLd,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return services.map((service) => ({ id: service.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const service = services.find((s) => s.id === id);

  if (!service) {
    return pageMetadata({
      title: "Service Not Found",
      description: "This service is no longer offered.",
      path: `/services/${id}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${service.name} in Lalitpur - Rs. ${service.price.toLocaleString()}`,
    description: `${service.description} Available at KIST Poly Clinic, Balkumari, Lalitpur from Rs. ${service.price.toLocaleString()}. Book an appointment today.`,
    path: `/services/${service.id}`,
    keywords: [
      service.name,
      `${service.name} Lalitpur`,
      `${service.name} price Nepal`,
    ],
  });
}

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const service = services.find((s) => s.id === id);

  if (!service) notFound();

  return (
    <>
      <JsonLd
        data={[
          serviceJsonLd({
            name: service.name,
            description: service.longDescription || service.description,
            price: service.price,
            path: `/services/${service.id}`,
          }),
          // The FAQ block on these pages is eligible for FAQ rich results.
          ...(service.faqs?.length ? [faqJsonLd(service.faqs)] : []),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: service.name, path: `/services/${service.id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
