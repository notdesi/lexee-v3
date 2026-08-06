import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { SidePanel } from "@/components/SidePanel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const tiemposHeadline = localFont({
  src: [
    {
      path: "./fonts/tiempos/TestTiemposHeadlineVF-Roman.ttf",
      style: "normal",
    },
    {
      path: "./fonts/tiempos/TestTiemposHeadlineVF-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-tiempos-headline",
  display: "swap",
  weight: "100 900",
});

const tiemposText = localFont({
  src: [
    {
      path: "./fonts/tiempos/TestTiemposTextVF-Roman.ttf",
      style: "normal",
    },
    {
      path: "./fonts/tiempos/TestTiemposTextVF-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-tiempos-text",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Lexee",
  description: "AI SaaS chat application prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${tiemposHeadline.variable} ${tiemposText.variable}`}
    >
      <body>
        <div className="flex h-[100dvh] min-h-0 w-full">
          <SidePanel />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
