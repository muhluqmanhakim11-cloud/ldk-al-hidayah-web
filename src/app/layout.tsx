import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ToasterProvider from "@/components/ToasterProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    template: "%s | LDK Al-Hidayah",
    default: "LDK Al-Hidayah - Lembaga Dakwah Kampus",
  },
  description: "Website resmi Lembaga Dakwah Kampus Al-Hidayah. Mari berkolaborasi dalam kebaikan dan merajut ukhuwah.",
  keywords: ["LDK", "Dakwah Kampus", "Mahasiswa Muslim", "Organisasi Islam"],
  authors: [{ name: "LDK Al-Hidayah" }],
  creator: "LDK Al-Hidayah",
  publisher: "LDK Al-Hidayah",
  metadataBase: new URL("https://ldk-alhidayah.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LDK Al-Hidayah",
    description: "Lembaga Dakwah Kampus Al-Hidayah",
    url: "https://ldk-alhidayah.vercel.app",
    siteName: "LDK Al-Hidayah",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LDK Al-Hidayah",
    description: "Website resmi Lembaga Dakwah Kampus Al-Hidayah",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToasterProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
