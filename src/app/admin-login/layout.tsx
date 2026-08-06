import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Staff Login",
  description: "Restricted staff sign-in for Kist Poly Clinic.",
  path: "/admin-login",
  noIndex: true,
});

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
