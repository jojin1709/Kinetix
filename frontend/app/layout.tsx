import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kinetix — Local Text-to-Video Studio",
  description: "Generate cinematic AI video from text, entirely on your own GPU. Developed by JOJIN JOHN.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
