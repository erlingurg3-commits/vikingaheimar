import type { Metadata } from "next";
import { Sora } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
// Vercel Web Analytics (added 2026-08-25). The /next subpath is the App Router
// build; it renders nothing and injects its script client-side, so it is
// SSR-safe in this server component.
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import SiteLayout from "./components/layout/SiteLayout";
import { getCurrentHours, getTodayLabel } from "@/lib/hours";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vikingaheimar.is";
const siteName = "Víkingaheimar";
const siteDescription =
  "Experience authentic Viking heritage in Reykjanesbær, Iceland. Explore ships, artifacts, and Norse storytelling.";

/**
 * Display Font: Norse by Joel Carrouche
 * Single-weight runic display font for headings and cinematic titles
 */
const norse = localFont({
  src: "../public/fonts/Norse.otf",
  variable: "--font-display",
  weight: "400",
  display: "swap",
});

/**
 * Body Font: Sora (modern, clean sans-serif)
 * Used for body text, UI, and supporting content
 * Excellent readability and neutral tone
 */
const sora = Sora({
  variable: "--font-text",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_IS",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/viking.jpg",
        width: 1200,
        height: 630,
        alt: "Viking heritage experience at Víkingaheimar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/viking.jpg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    shortcut: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentHours = getCurrentHours();
  const museumSchema = {
    "@context": "https://schema.org",
    "@type": "Museum",
    name: siteName,
    description: siteDescription,
    url: siteUrl,
    image: `${siteUrl}/viking.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Reykjanesbær",
      addressCountry: "IS",
    },
    touristType: "Cultural tourism",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: currentHours.open,
      closes: currentHours.close,
    },
  };

  return (
    <html lang="is" className="scroll-smooth">
      <body
        className={`${norse.variable} ${sora.variable} bg-base-charcoal text-off-white antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(museumSchema) }}
        />
        <SiteLayout todayHoursLabel={getTodayLabel()}>{children}</SiteLayout>
        <Script
          src="https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=20a864e3-4bf8-45c4-864f-62c268deb95a"
          strategy="afterInteractive"
        />
        {/* Vercel Web Analytics — mounted once, site-wide (2026-08-25) */}
        <Analytics />
      </body>
    </html>
  );
}
