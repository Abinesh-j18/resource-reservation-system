import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PrimeReserve - Resource Reservation Management System",
  description:
    "Centralized web application to manage shared physical resources, prevent overlapping reservations, and track resource availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50/50 text-slate-900 antialiased`}>
        <Navbar />
        <main className="flex-1 pb-12">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
