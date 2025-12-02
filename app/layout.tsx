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
    "return offer rates",
    "internship return offer",
    "company return offer statistics",
    "tech internship return offers",
    "return offer data by company",
    "internship conversion rate",
    "internship conversion rate by company",
    "internship conversion rate by company and year",
    "internship conversion rate by company and term",
    "internship conversion rate by company and year and term",
    "internship conversion rate by company and year and term and source",
    "internship conversion rate by company and year and term and source and school",
    "internship conversion rate by company and year and term and source and school and position type",
    "internship conversion rate by company and year and term and source and school and position type and intern type",
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
  // Icons are automatically handled by Next.js via app/icon.tsx (PNG) and app/icon.svg (SVG)
  // Next.js will automatically add the appropriate link tags to the <head>
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
