import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BrandHeader } from "@/components/shared/BrandHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "College Credit Planner | FinLit Garden",
  description:
    "Build a free, personalized plan to graduate high school with up to two years of free college credit using dual enrollment at your local California community college.",
  keywords: [
    "dual enrollment",
    "college credit",
    "California community college",
    "Cal-GETC",
    "ADT",
    "transfer",
    "FinLit Garden",
  ],
  openGraph: {
    title: "College Credit Planner | FinLit Garden",
    description:
      "A free, personalized plan to graduate high school with up to two years of free college credit.",
    siteName: "FinLit Garden",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#4A5568] antialiased">
        <BrandHeader />
        <main className="flex-1">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
