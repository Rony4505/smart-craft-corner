import type { Metadata } from "next";
import { Noto_Sans_Bengali, Syne } from "next/font/google";
import { CartProvider } from "@/lib/fashion/cart-context";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Noto_Sans_Bengali({
  variable: "--font-body",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Noorzaa | Luxury Womenswear for Bangladesh",
      template: "%s | Noorzaa",
    },
    description:
      "Noorzaa — premium women's fashion for Bangladesh. Curated collections, festive and everyday wear, with nationwide delivery.",
    keywords: [
      "Noorzaa",
      "Bangladesh womens fashion",
      "luxury ecommerce Bangladesh",
      "ladies boutique Dhaka",
      "মেয়েদের অনলাইন শপ",
      "লাক্সারি ফ্যাশন বাংলাদেশ",
    ],
    alternates: { canonical: "/" },
    icons: {
      icon: [{ url: "/icon", type: "image/png" }],
      apple: [{ url: "/apple-icon", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url: siteUrl,
      siteName: "Noorzaa",
      title: "Noorzaa | Luxury Womenswear for Bangladesh",
      description:
        "Premium women's fashion, festive edits, and simple luxury shopping for Bangladesh.",
      images: [
        {
          url: "/apple-icon",
          width: 180,
          height: 180,
          alt: "Noorzaa",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Noorzaa | Luxury Womenswear for Bangladesh",
      description:
        "Premium women's fashion, festive edits, and simple luxury shopping for Bangladesh.",
      images: ["/apple-icon"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <LocaleProvider>
          <CartProvider>{children}</CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
