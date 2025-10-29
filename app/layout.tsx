"use client";

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";

export const metadata: Metadata = {
  title: "SeJoga",
  description: " ",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/sejoga-id/Meeple-192.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#35588C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#35588C" />
      </head>
      <body>
        {loading && (
          <SplashScreen
            onFinish={() => setLoading(false)}
            logoUrl="/sejoga-id/White512.png" // 👈 usa o ícone branco aqui
          />
        )}
        {!loading && children}
      </body>
    </html>
  );
}
