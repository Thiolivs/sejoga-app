import type { Metadata, Viewport } from "next";
import { Poppins, Caveat, Shadows_Into_Light, Joti_One, Aladin } from 'next/font/google';
import "./globals.css";
import { BackgroundManager } from "@/components/BackgroundManager";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

const shadowsIntoLight = Shadows_Into_Light({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shadows',
});

const aladin = Aladin({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-aladin',
});

const jotiOne = Joti_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-joti',
});

export const metadata: Metadata = {
  title: "SeJoga",
  description: " ",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/sejoga-id/White192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#35588C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`
          ${poppins.variable} 
          ${caveat.variable} 
          ${shadowsIntoLight.variable} 
          ${jotiOne.variable}
          ${aladin.variable}
      `}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0096FF" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={poppins.className}
        style={{
          backgroundImage: 'url(/images/backgrounds/rainbow.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
        }}
      >
        <BackgroundManager />
        {children}
      </body>
    </html>
  );
}