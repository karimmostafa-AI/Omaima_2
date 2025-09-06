import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Omaima - Professional Women's Formal Wear",
  description: "Sophisticated suits and customizable uniforms for the modern professional woman. Premium fabrics, expert tailoring, fast delivery.",
  keywords: "women's suits, professional attire, custom uniforms, business wear, tailored suits",
  authors: [{ name: "Omaima" }],
  creator: "Omaima",
  publisher: "Omaima",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Omaima",
    title: "Omaima - Professional Women's Formal Wear",
    description: "Sophisticated suits and customizable uniforms for the modern professional woman.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omaima - Professional Women's Formal Wear",
    description: "Sophisticated suits and customizable uniforms for the modern professional woman.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
