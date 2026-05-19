import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstraQuant Stock Intelligence",
  description: "Professional AI stock market intelligence platform"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
