import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraQuant Stock Intelligence",
  description: "Professional AI stock market intelligence platform",
  manifest: "/manifest.webmanifest",
  applicationName: "AstraQuant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AstraQuant"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icons/astraquant-icon.svg", type: "image/svg+xml" }
    ],
    apple: [
      { url: "/icons/astraquant-icon.svg", type: "image/svg+xml" }
    ]
  },
  openGraph: {
    title: "AstraQuant Stock Intelligence",
    description: "Professional AI stock market intelligence platform",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#101010"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
