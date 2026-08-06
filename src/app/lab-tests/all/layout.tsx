import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata = pageMetadata({
  title: "All Laboratory Tests & Prices",
  description:
    "Full list of individual laboratory tests at KIST Poly Clinic, Lalitpur - CBC, blood sugar, lipid profile, thyroid, liver and kidney function, HbA1c and urine routine, with prices and turnaround times.",
  path: "/lab-tests/all",
  keywords: [
    "lab test price Nepal",
    "CBC test cost Lalitpur",
    "thyroid test Nepal",
    "lipid profile price Kathmandu",
  ],
});

export default function AllTestsLayout({
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
          { name: "All Tests", path: "/lab-tests/all" },
        ])}
      />
      {children}
    </>
  );
}
