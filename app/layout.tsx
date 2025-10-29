import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat, Caveat_Brush } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"], 
  variable: "--font-caveat", 
  display: "swap", 
});

const caveatBrush = Caveat_Brush({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-caveat-brush",
  display: "swap",
});


export const metadata: Metadata = {
  title: "SeJoga",
  description: "Seu app de boardgames",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/sejoga-id/White192.png"
  },
  themeColor: "#DD2228"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}