import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Selah Kignit — Ethiopian Protestant Worship Songbook",
  description:
    "Discover and organize Ethiopian Protestant mezmur. Explore songs, Kignit, chords, and download the Selah Kignit Android application.",
  metadataBase: new URL("https://selahkignit.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Selah Kignit — Ethiopian Protestant Worship Songbook",
    description:
      "Discover, organize, and access Ethiopian Protestant mezmur in one beautifully designed Android application.",
    url: "https://selahkignit.vercel.app",
    siteName: "Selah Kignit",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
