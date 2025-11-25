import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import TopNav from "./components/TopNav";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "rorates.fyi - Company Return Offer Statistics",
    template: "%s | rorates.fyi",
  },
  description:
    "Discover return offer rates for tech companies. Find out which companies extend the most return offers to interns. Search by company name to see detailed statistics and trends.",
  keywords: [
    "return offer rate",
    "internship return offer",
    "company return offer statistics",
    "tech internship return offers",
    "return offer data",
    "internship conversion rate",
  ],
  authors: [{ name: "rorates.fyi" }],
  creator: "rorates.fyi",
  publisher: "rorates.fyi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.SITE_URL || "https://rorates.fyi"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "16x16" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "180x180" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Return Offer Rates.fyi - Company Return Offer Statistics",
    description:
      "Discover return offer rates for tech companies. Find out which companies extend the most return offers to interns.",
    siteName: "Return Offer Rates.fyi",
    images: [
      {
        url: "/icon.svg",
        width: 1200,
        height: 1200,
        alt: "Return Offer Rates.fyi Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Return Offer Rates.fyi - Company Return Offer Statistics",
    description:
      "Discover return offer rates for tech companies. Find out which companies extend the most return offers to interns.",
    creator: "@roratesfyi",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const IS_PROD = process.env.ENVIRONMENT != "dev";

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
        <Providers>
          <TopNav />
          {children}
        </Providers>
        {IS_PROD && <Analytics />}
      </body>
    </html>
  );
}
