import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers.jsx";
import SiteHeaderClient from "../components/layout/SiteHeaderClient.jsx";
import { SiteFooter } from "../components/layout/SiteFooter.jsx";
import { AuthModalHost } from "../components/auth/AuthModalHost.jsx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "RisheeMuni • Intelligent Indian Astrology Platform",
  description:
    "AI astrologers, Kundli, Panchang, gemstone store, and personalised reports with secure Indian payments.",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/logoR.png",
    apple: "/assets/logoR.png",
  },
  openGraph: {
    title: "RisheeMuni — Your digital astrology companion",
    description:
      "Chat with AI astrologers, order gemstones, and access Vedic wisdom tailored for you.",
    url: "https://bramhanai.example",
    siteName: "RisheeMuni",
    type: "website",
    images: ["/assets/logoR.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col bg-[color:var(--color-background)]">
            <SiteHeaderClient />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <AuthModalHost />
        </Providers>
      </body>
    </html>
  );
}
