import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
    <html lang="en" className="bg-[#F8F9FA] text-[#212529] min-h-screen">
      <body className={`${inter.className} min-h-screen flex bg-[#F8F9FA]`}>
        <LanguageProvider>
          <Sidebar />
          <main className="flex-1 ml-[260px] min-h-screen p-8 bg-[#F8F9FA]">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
