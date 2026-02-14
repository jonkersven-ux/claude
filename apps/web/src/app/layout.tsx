import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HostIQ — Corporate Sports Hospitality Platform",
  description:
    "The operating system for corporate sports hospitality. Manage guests, plan matches, measure ROI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
