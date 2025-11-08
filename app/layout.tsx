import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BackgroundManager } from "@/components/BackgroundManager";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#35588C" />
      </head>
      <body 
        style={{
          backgroundImage: 'url(/images/backgrounds/rainbow.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          minHeight: '100vh'
        }}
      >
        <BackgroundManager />
        {children}
      </body>
    </html>
  );
}