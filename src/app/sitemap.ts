import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { doctors } from "@/data/doctors";
import { services } from "@/data/services";
import { labTests, testPackages } from "@/data/labTests";
import { prisma } from "@/lib/prisma";

// Medicine categories come from the database, so the sitemap must not be
// frozen at build time.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const entry = (
  path: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"]
): Entry => ({
  url: absoluteUrl(path),
  lastModified: new Date(),
  changeFrequency,
  priority,
});

/**
 * Medicine category slugs are the category name with whitespace stripped,
 * matching how /epharmacy/category/[category] resolves them.
 */
async function medicineCategoryEntries(): Promise<Entry[]> {
  try {
    const rows = await prisma.medicine.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return rows.map((row: { category: string }) =>
      entry(
        `/epharmacy/category/${encodeURIComponent(
          row.category.replace(/\s+/g, "")
        )}`,
        0.6,
        "weekly"
      )
    );
  } catch (error) {
    // A database outage must not take the whole sitemap down.
    console.error("Sitemap: failed to load medicine categories", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: Entry[] = [
    entry("/", 1.0, "weekly"),
    entry("/services", 0.9, "monthly"),
    entry("/lab-tests", 0.9, "weekly"),
    entry("/lab-tests/packages", 0.9, "weekly"),
    entry("/lab-tests/all", 0.8, "weekly"),
    entry("/epharmacy", 0.9, "daily"),
    entry("/doctors", 0.9, "monthly"),
    entry("/about", 0.6, "yearly"),
    entry("/contact", 0.7, "yearly"),
  ];

  const servicePages = services.map((service) =>
    entry(`/services/${service.id}`, 0.8, "monthly")
  );

  const doctorPages = doctors.map((doctor) =>
    entry(`/doctors/${doctor.id}`, 0.7, "monthly")
  );

  const packagePages = testPackages.map((pkg) =>
    entry(`/lab-tests/package/${pkg.id}`, 0.8, "monthly")
  );

  const testPages = labTests.map((test) =>
    entry(`/lab-tests/test/${test.id}`, 0.7, "monthly")
  );

  return [
    ...staticPages,
    ...servicePages,
    ...doctorPages,
    ...packagePages,
    ...testPages,
    ...(await medicineCategoryEntries()),
  ];
}
