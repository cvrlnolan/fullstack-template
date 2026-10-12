import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fullstack Template",
  description: "Next.js + FastAPI + AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="mx-auto min-h-screen max-w-2xl p-6 antialiased">{children}</body>
    </html>
  );
}
