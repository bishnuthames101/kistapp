import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Set a New Password",
  description: "Choose a new password for your Kist Poly Clinic account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
