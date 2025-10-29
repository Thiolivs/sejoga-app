import type { Metadata, Viewport } from "next";

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
  themeColor: "#51AFF7", 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
