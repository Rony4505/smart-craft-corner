import type { Metadata } from "next";
import { FashionHomePage } from "@/components/FashionHomePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Noorzaa | Luxury Womenswear for Bangladesh",
  description:
    "Noorzaa — premium women's fashion for Bangladesh. Curated collections, festive and everyday wear, with nationwide delivery.",
  alternates: {
    canonical: "/shop",
  },
};

export default async function ShopHomePage() {
  return <FashionHomePage />;
}
