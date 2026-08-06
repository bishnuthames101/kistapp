import type { Metadata } from "next";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

type Props = {
  children: React.ReactNode;
  params: Promise<{ category: string }>;
};

/** URL slugs are the category name with spaces stripped ("PainRelief"). */
const humanize = (slug: string) =>
  decodeURIComponent(slug).replace(/([a-z])([A-Z])/g, "$1 $2").trim();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = humanize(category);

  return pageMetadata({
    title: `${name} Medicines`,
    description: `Browse ${name.toLowerCase()} medicines available at Kist Poly Clinic's online pharmacy in Lalitpur, with home delivery across the Kathmandu Valley.`,
    path: `/epharmacy/category/${category}`,
    keywords: [`${name} medicine Nepal`, `buy ${name} online Lalitpur`],
  });
}

export default async function CategoryLayout({ children, params }: Props) {
  const { category } = await params;
  const name = humanize(category);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Online Pharmacy", path: "/epharmacy" },
          { name, path: `/epharmacy/category/${category}` },
        ])}
      />
      {children}
    </>
  );
}
