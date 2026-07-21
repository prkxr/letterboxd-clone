import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import MainNav from "@/components/main-nav";
import "./globals.css";
import "@/lib/env";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CineJournal | Social Movie Diary",
  description:
    "A cinematic movie-tracking platform with profiles, logs, reviews, lists, watchlists, social feeds, and discovery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} film-grain`}> 
        <MainNav />
        {children}
      </body>
    </html>
  );
}
