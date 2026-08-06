import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Reset Your Password",
  description: "Request a password reset link for your KIST Poly Clinic account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
