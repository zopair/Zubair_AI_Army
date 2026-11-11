import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zubair Elite Builder",
  description: "أدوات عملية لتحسين الملف المهني وبناء الحضور الرقمي"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
