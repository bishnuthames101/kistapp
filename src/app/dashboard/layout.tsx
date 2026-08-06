import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Dashboard",
  description: "Manage your appointments, lab tests, prescriptions and pharmacy orders.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
