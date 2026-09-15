import type { Metadata } from "next";
import { Noto_Sans_Bengali, Syne } from "next/font/google";
import { SiteAppearanceProvider } from "@/components/SiteAppearanceProvider";
import { CartProvider } from "@/lib/fashion/cart-context";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { isFashionMode } from "@/lib/app-mode";
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
  const fashion = isFashionMode();

  if (fashion) {
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

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "BloodLink BD | Bangladesh Blood Donor Finder",
      template: "%s | BloodLink BD",
    },
    description:
      "BloodLink BD helps people in Bangladesh find blood donors by blood group and location. Post urgent needs, check availability, and connect securely.",
    keywords: [
      "BloodLink",
      "BloodLink BD",
      "blood donor Bangladesh",
      "blood donation",
      "রক্তদাতা",
      "রক্তদান",
      "bloodlinkbd.org",
    ],
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icon", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: "/apple-icon", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: "bn_BD",
      url: siteUrl,
      siteName: "BloodLink BD",
      title: "BloodLink BD | Bangladesh Blood Donor Finder",
      description: "Find blood donors across Bangladesh by blood group and location.",
      images: [
        {
          url: "/bloodlink-logo.png",
          width: 512,
          height: 512,
          alt: "BloodLink BD logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "BloodLink BD | Bangladesh Blood Donor Finder",
      description: "Find blood donors across Bangladesh by blood group and location.",
      images: ["/bloodlink-logo.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <LocaleProvider>
          <CartProvider>
            <SiteAppearanceProvider>{children}</SiteAppearanceProvider>
          </CartProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
