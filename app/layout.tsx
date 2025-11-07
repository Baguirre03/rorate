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
    default: "Return Offer Rates.fyi - Company Return Offer Statistics",
    template: "%s | Return Offer Rates.fyi",
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
  authors: [{ name: "Return Offer Rates.fyi" }],
  creator: "Return Offer Rates.fyi",
  publisher: "Return Offer Rates.fyi",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://rorates.fyi"
  ),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/trend.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/trend.png", type: "image/png" }],
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
        url: "/trend.png",
        width: 1200,
        height: 630,
        alt: "Return Offer Rates.fyi - Company Return Offer Statistics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Return Offer Rates.fyi - Company Return Offer Statistics",
    description:
      "Discover return offer rates for tech companies. Find out which companies extend the most return offers to interns.",
    creator: "@roratesfyi",
    images: ["/trend.png"],
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
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
