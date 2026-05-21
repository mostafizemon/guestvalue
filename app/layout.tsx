import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GuestValue Dashboard",
  description: "Luxury hotel concierge SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0a0a0a] text-white min-h-screen">
      <body className={`${inter.className} min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 ml-[240px] min-h-screen p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
