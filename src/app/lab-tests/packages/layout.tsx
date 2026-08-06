import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "Health Checkup Packages",
  description:
    "Compare full body checkups, diabetes, heart, hormone, fertility and cancer screening packages at KIST Poly Clinic, Lalitpur. NABL-certified lab with home sample collection.",
  path: "/lab-tests/packages",
  keywords: [
    "health checkup package Nepal",
    "full body checkup Lalitpur price",
    "diabetes profile test Nepal",
    "heart health package Kathmandu",
  ],
});

export default function PackagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Lab Tests", path: "/lab-tests" },
          { name: "Health Packages", path: "/lab-tests/packages" },
        ])}
      />
      {children}
    </>
  );
}
