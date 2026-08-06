import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { labTests } from "@/data/labTests";
import { breadcrumbJsonLd, medicalTestJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return labTests.map((test) => ({ id: test.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const test = labTests.find((t) => t.id === id);

  if (!test) {
    return pageMetadata({
      title: "Test Not Found",
      description: "This laboratory test is no longer available.",
      path: `/lab-tests/test/${id}`,
      noIndex: true,
    });
  }

  return pageMetadata({
    title: `${test.name} - Rs. ${test.price.toLocaleString()}`,
    description: `${test.description} Results in ${test.turnaroundTime}. ${test.requirements}. Book at KIST Poly Clinic, Lalitpur for Rs. ${test.price.toLocaleString()}.`,
    path: `/lab-tests/test/${test.id}`,
    keywords: [test.name, `${test.name} price Nepal`, `${test.name} Lalitpur`],
  });
}

export default async function TestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { id } = await params;
  const test = labTests.find((t) => t.id === id);

  if (!test) notFound();

  return (
    <>
      <JsonLd
        data={[
          {
            ...medicalTestJsonLd({
              name: test.name,
              description: test.description,
              price: test.price,
              path: `/lab-tests/test/${test.id}`,
            }),
            preparation: test.requirements,
            additionalProperty: {
              "@type": "PropertyValue",
              name: "Turnaround time",
              value: test.turnaroundTime,
            },
          },
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Lab Tests", path: "/lab-tests" },
            { name: "All Tests", path: "/lab-tests/all" },
            { name: test.name, path: `/lab-tests/test/${test.id}` },
          ]),
        ]}
      />
      {children}
    </>
  );
}
