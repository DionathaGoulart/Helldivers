import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import { Orbitron, Barlow_Condensed, Rajdhani } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SecurityWarning from "@/components/layout/SecurityWarning";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gooddivers Arsenal - Helldivers 2",
  description: "Gerencie seu arsenal completo e sirva a Democracia™",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">

      <body
        className={`${orbitron.variable} ${barlowCondensed.variable} ${rajdhani.variable} antialiased`}
      >
        <NextTopLoader
          color="#00d9ff"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #00d9ff,0 0 5px #00d9ff"
          zIndex={1600}
        />
        <LanguageProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-[#0f1419]">
              <SecurityWarning />
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
