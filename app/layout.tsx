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
  description: " ",
  manifest: "/manifest.json", 
  themeColor: "#FFFFFF", 
  appleWebApp: { 
    capable: true,
    statusBarStyle: "default",
    title: "SeJoga",
  },
  icons: { 
    icon: "/icon-splash-branco.png",
    apple: "/icon-splash-branco.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} ${caveatBrush.variable} antialiased`}
      >
          {children}
      </body>
    </html>
  );
}