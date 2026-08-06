import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "Online Pharmacy - Order Medicines Online",
  description:
    "Order genuine medicines online from Kist Poly Clinic's e-pharmacy in Lalitpur. Browse by category, upload your prescription and get doorstep delivery across the Kathmandu Valley.",
  path: "/epharmacy",
  keywords: [
    "online pharmacy Nepal",
    "buy medicine online Lalitpur",
    "medicine delivery Kathmandu",
    "e-pharmacy Nepal",
  ],
});

export default function EpharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Online Pharmacy", path: "/epharmacy" },
        ])}
      />
      {children}
    </>
  );
}
