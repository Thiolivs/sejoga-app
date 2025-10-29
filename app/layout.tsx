import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RootLayoutClient } from "@/components/RootLayoutClient";

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
  return (
    <html lang="pt-BR">
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
