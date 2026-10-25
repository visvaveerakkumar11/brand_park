import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/config";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SessionStateProvider } from "@/components/session-state";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — Men's Clothing | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0a3525" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="sr-only z-50 bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
          Skip to content
        </a>
        <SessionStateProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionStateProvider>
      </body>
    </html>
  );
}
