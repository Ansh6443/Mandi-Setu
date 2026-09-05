import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope, Noto_Sans_Devanagari, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import WheatCorner from "@/components/WheatCorner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kisan Setu | Smart Market Procurement Portal",
  description: "A farmer and officer portal for transparent mandi queue management and digital procurement flows.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="hi" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${manrope.variable} ${notoSansDevanagari.variable}`}>
      <body style={{ position: 'relative', minHeight: '100vh' }}>
        <LanguageProvider>
          {children}
          <WheatCorner />
        </LanguageProvider>
      </body>
    </html>
  );
}