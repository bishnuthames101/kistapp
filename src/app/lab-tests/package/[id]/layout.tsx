import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { testPackages } from "@/data/labTests";
import { breadcrumbJsonLd, medicalTestJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return testPackages.map((pkg) => ({ id: pkg.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const pkg = testPackages.find((p) => p.id === id);

  if (!pkg) {
    return pageMetadata({
      title: "Package Not Found",
      description: "This health checkup package is no longer available.",
      path: `/lab-tests/package/${id}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${pkg.name} - Rs. ${pkg.price.toLocaleString()}`,
    description: `${pkg.description} Includes ${pkg.tests.length} tests, results in ${pkg.turnaroundTime}. Book at KIST Poly Clinic, Lalitpur for Rs. ${pkg.price.toLocaleString()}.`,
    path: `/lab-tests/package/${pkg.id}`,
    images: [pkg.image],
    keywords: [pkg.name, `${pkg.name} price Nepal`, `${pkg.category} test Lalitpur`],
  });
}

export default async function PackageLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const pkg = testPackages.find((p) => p.id === id);

  if (!pkg) notFound();

  return (
    <>
      <JsonLd
        data={[
          {
            ...medicalTestJsonLd({
              name: pkg.name,
              description: pkg.description,
              price: pkg.price,
              path: `/lab-tests/package/${pkg.id}`,
              image: pkg.image,
            }),
            // Listing the included tests lets search engines match this package
            // against queries for any individual test inside it.
            subTest: pkg.tests.map((test) => ({
              "@type": "MedicalTest",
              name: test,
            })),
            preparation: pkg.requirements,
            additionalProperty: {
              "@type": "PropertyValue",
              name: "Turnaround time",
              value: pkg.turnaroundTime,
            },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lab Tests", path: "/lab-tests" },
            { name: "Health Packages", path: "/lab-tests/packages" },
            { name: pkg.name, path: `/lab-tests/package/${pkg.id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
