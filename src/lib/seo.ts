import type { Metadata } from "next";

/**
 * Single source of truth for the clinic's name, address and phone (NAP).
 * Search engines cross-reference these against Google Business Profile and
 * directory listings, so they must match those listings character for character.
 */
export const siteConfig = {
  name: "KIST Poly Clinic",
  legalName: "KIST Poly Clinic Pvt. Ltd.",
  shortName: "KIST Clinic",
  url: (process.env.NEXT_PUBLIC_APP_URL || "https://kistpolyclinic.com.np").replace(
    /\/$/,
    ""
  ),
  description:
    "KIST Poly Clinic in Balkumari, Lalitpur offers doctor consultations, NABL-certified lab tests, health checkup packages, home sample collection and an online pharmacy with doorstep delivery.",
  locale: "en_NP",
  telephone: "+977-01-5202097",
  email: "kistpolyclinic@gmail.com",
  address: {
    street: "Balkumari-Kharibot",
    locality: "Lalitpur",
    region: "Bagmati Province",
    country: "NP",
  },
  geo: {
    latitude: 27.670335,
    longitude: 85.338975,
  },
  openingHours: {
    days: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "07:00",
    closes: "20:00",
  },
  social: [
    "https://www.tiktok.com/@kistpolyclinic",
  ],
  /** Prices across the site are quoted in Nepalese Rupees. */
  currency: "NPR",
} as const;

export const absoluteUrl = (path = "/") =>
  `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Set for gated/transactional pages that add no search value. */
  noIndex?: boolean;
  images?: string[];
  keywords?: string[];
};

/**
 * Builds a complete metadata object - canonical, Open Graph and Twitter card -
 * so no page has to remember the boilerplate.
 */
export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
  images,
  keywords,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: `${title} | ${siteConfig.name}`,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                              JSON-LD builders                              */
/* -------------------------------------------------------------------------- */

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: siteConfig.address.street,
  addressLocality: siteConfig.address.locality,
  addressRegion: siteConfig.address.region,
  addressCountry: siteConfig.address.country,
};

/** The clinic itself - the anchor entity for local search and the knowledge panel. */
export function clinicJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": absoluteUrl("/#clinic"),
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    description: siteConfig.description,
    telephone: siteConfig.telephone,
    email: siteConfig.email,
    image: absoluteUrl("/opengraph-image"),
    logo: absoluteUrl("/logo.jpg"),
    priceRange: "रु",
    currenciesAccepted: siteConfig.currency,
    address: postalAddress,
    geo: {
      "@type": "GeoCoordinates",
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: siteConfig.openingHours.days,
        opens: siteConfig.openingHours.opens,
        closes: siteConfig.openingHours.closes,
      },
    ],
    sameAs: siteConfig.social,
    medicalSpecialty: [
      "PrimaryCare",
      "InternalMedicine",
      "Surgical",
      "Musculoskeletal",
      "Pathology",
    ],
    availableService: [
      { "@type": "MedicalTherapy", name: "OPD Consultation" },
      { "@type": "MedicalTest", name: "Laboratory Testing" },
      { "@type": "MedicalTherapy", name: "Home Sample Collection" },
      { "@type": "MedicalTherapy", name: "Doctor Home Visit" },
    ],
  };
}

/** Enables the sitelinks search box and names the site for search engines. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": absoluteUrl("/#clinic") },
    inLanguage: "en-NP",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/epharmacy?search={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function physicianJsonLd(doctor: {
  name: string;
  specialty: string;
  image?: string;
  path: string;
  opdCharge?: number;
  education?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": absoluteUrl(doctor.path),
    name: doctor.name,
    medicalSpecialty: doctor.specialty,
    url: absoluteUrl(doctor.path),
    ...(doctor.image ? { image: absoluteUrl(doctor.image) } : {}),
    ...(doctor.education ? { alumniOf: doctor.education } : {}),
    worksFor: { "@id": absoluteUrl("/#clinic") },
    address: postalAddress,
    telephone: siteConfig.telephone,
    ...(doctor.opdCharge
      ? {
          makesOffer: {
            "@type": "Offer",
            name: "OPD Consultation",
            price: doctor.opdCharge,
            priceCurrency: siteConfig.currency,
          },
        }
      : {}),
  };
}

export function medicalTestJsonLd(test: {
  name: string;
  description: string;
  price: number;
  path: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    "@id": absoluteUrl(test.path),
    name: test.name,
    description: test.description,
    url: absoluteUrl(test.path),
    ...(test.image ? { image: absoluteUrl(test.image) } : {}),
    performer: { "@id": absoluteUrl("/#clinic") },
    offers: {
      "@type": "Offer",
      price: test.price,
      priceCurrency: siteConfig.currency,
      availability: "https://schema.org/InStock",
      url: absoluteUrl(test.path),
    },
  };
}

export function serviceJsonLd(service: {
  name: string;
  description: string;
  price: number;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    "@id": absoluteUrl(service.path),
    name: service.name,
    description: service.description,
    url: absoluteUrl(service.path),
    performer: { "@id": absoluteUrl("/#clinic") },
    offers: {
      "@type": "Offer",
      price: service.price,
      priceCurrency: siteConfig.currency,
      availability: "https://schema.org/InStock",
    },
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
