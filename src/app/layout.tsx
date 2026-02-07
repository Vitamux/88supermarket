import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthListener from "../components/AuthListener";
import LocationModal from "../components/LocationModal";
import PatternBackground from "../components/PatternBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "88 Supermarket | Fresh & Fast",
  description: "Your favorite local supermarket with 8+ locations. Fresh produce, bakery, and meats delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthListener />
        <PatternBackground />
        <LocationModal />
        {children}
      </body>
    </html>
  );
}
