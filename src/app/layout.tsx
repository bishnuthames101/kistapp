import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import ConditionalLayout from "@/components/ConditionalLayout";
import InactivityMonitor from "@/components/InactivityMonitor";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KIST Poly Clinic - Quality Healthcare Services",
  description: "Providing quality healthcare services with modern facilities and experienced professionals in Lalitpur, Nepal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
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
