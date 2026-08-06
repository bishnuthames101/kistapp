import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import InactivityMonitor from "@/components/InactivityMonitor";
import ScrollToTop from "@/components/ScrollToTop";
import JsonLd from "@/components/JsonLd";
import { clinicJsonLd, siteConfig, websiteJsonLd } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // Makes every relative canonical/OG URL elsewhere in the app resolve correctly.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Doctors, Lab Tests & Pharmacy in Lalitpur`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "clinic in Lalitpur",
    "polyclinic Kathmandu",
    "doctor consultation Nepal",
    "lab test Lalitpur",
    "health checkup package Nepal",
    "online pharmacy Nepal",
    "home sample collection Lalitpur",
    "Balkumari clinic",
    "Kist Poly Clinic",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: `${siteConfig.name} - Doctors, Lab Tests & Pharmacy in Lalitpur`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Doctors, Lab Tests & Pharmacy in Lalitpur`,
    description: siteConfig.description,
  },
  category: "health",
  formatDetection: {
    telephone: true,
    address: true,
  },
  // Add the token from Google Search Console once the property is verified.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NP">
      <body className={inter.className} suppressHydrationWarning>
        {/* Site-wide entities: the clinic and the website itself. Page-level
            schemas reference these by @id instead of repeating them. */}
        <JsonLd data={[clinicJsonLd(), websiteJsonLd()]} />
        <Providers>
          <InactivityMonitor />
          <ScrollToTop />
          <div className="min-h-screen bg-white">
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
