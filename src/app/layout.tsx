

import type { Metadata } from "next";
import { Geologica, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import "../styles/globals.css";

const geistSans = Geologica({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Superia",
  description: "Superia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
