import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Portal | Dashboard",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
