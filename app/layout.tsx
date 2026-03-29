import type { Metadata } from "next";
import { Merriweather, Sora } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SiteLayout from "./components/layout/SiteLayout";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vikingaheimar.is";
const siteName = "Víkingaheimar";
const siteDescription =
  "Experience authentic Viking heritage in Reykjanesbær, Iceland. Explore ships, artifacts, and Norse storytelling.";

/**
 * Display Font: Merriweather (premium serif)
 * Used for H1-H3, hero text, and cinematic titles
 * Professional, Nordic-heritage aesthetic
 */
const merriweather = Merriweather({
  variable: "--font-display",
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
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
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
  };

  return (
    <html lang="is" className="scroll-smooth">
      <body
        className={`${merriweather.variable} ${sora.variable} bg-base-charcoal text-off-white antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(museumSchema) }}
        />
        <SiteLayout>{children}</SiteLayout>
        <Script
          src="https://widgets.bokun.io/assets/javascripts/apps/build/BokunWidgetsLoader.js?bookingChannelUUID=20a864e3-4bf8-45c4-864f-62c268deb95a"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
