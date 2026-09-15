import { Suspense } from "react";
import { FashionFooter } from "@/components/fashion/FashionFooter";
import { FashionHeader } from "@/components/fashion/FashionHeader";
import { HomeCategoryShowcase } from "@/components/fashion/HomeCategoryShowcase";
import { HomeProductBrowse } from "@/components/fashion/HomeProductBrowse";
import { PromoCarousel } from "@/components/fashion/PromoCarousel";
import { HomeCouponStrip } from "@/components/fashion/HomeCouponStrip";
import { ChatSupportWidget } from "@/components/fashion/ChatSupportWidget";
import { DeveloperWatermark } from "@/components/fashion/DeveloperCredit";
import { AnnouncementBar } from "@/components/fashion/AnnouncementBar";
import { OrderBottomNav } from "@/components/fashion/OrderBottomNav";
import { SiteEntryPopup } from "@/components/fashion/SiteEntryPopup";
import { buildCarouselSlides } from "@/lib/fashion/carousel-slides";
import { getCategories } from "@/lib/fashion/categories-server";
import {
  getActiveOffers,
  getActivePromoBanners,
  getNewProducts,
  getStoreSettings,
  listProducts,
  listPublicCoupons,
} from "@/lib/fashion/store";

export async function FashionHomePage() {
  const [offers, newProducts, settings, banners, coupons, categories, products] =
    await Promise.all([
      getActiveOffers(),
      getNewProducts(14),
      getStoreSettings(),
      getActivePromoBanners(),
      listPublicCoupons(),
      getCategories(),
      listProducts(),
    ]);

  const carouselSlides = buildCarouselSlides(banners);
  const displayCoupons = settings.showCouponsOnHome !== false ? coupons : [];

  return (
    <main className="min-h-screen bg-[linear-gradient(165deg,#0a1628_0%,#0f2744_45%,#122d52_100%)] pb-20 md:pb-0">
      <ChatSupportWidget />
      <SiteEntryPopup />
      <AnnouncementBar settings={settings} />
      <section className="relative border-b border-white/10 bg-[radial-gradient(ellipse_at_12%_8%,rgba(30,74,122,0.35),transparent_52%),radial-gradient(ellipse_at_92%_92%,rgba(18,45,82,0.45),transparent_48%),linear-gradient(135deg,#0a1628_0%,#0f2744_38%,#122d52_72%,#0d1f38_100%)]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%,rgba(30,74,122,0.12)_100%)]" />
          <div className="hero-orb absolute -left-16 top-24 h-72 w-72 rounded-full bg-[#1e4a7a]/30 blur-3xl" />
          <div className="hero-drift absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#2a5f8f]/25 blur-3xl" />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-5 pb-16 pt-8 text-[#e8eef7] md:px-8 md:pb-24 md:pt-10">
          <FashionHeader variant="light" />

          <div className="relative mt-6 space-y-5">
            {carouselSlides.length > 0 ? (
              <div className="overflow-hidden rounded-[1.5rem] border border-white/20 shadow-[0_12px_40px_rgba(74,51,72,0.12)]">
                <PromoCarousel slides={carouselSlides} />
              </div>
            ) : null}
            {displayCoupons.length > 0 ? (
              <HomeCouponStrip coupons={displayCoupons} products={products} />
            ) : null}
          </div>

          {/* Image 1: hero title/CTAs replaced by admin categories */}
          <HomeCategoryShowcase categories={categories} />
        </div>
      </section>

      <Suspense
        fallback={
          <div className="border-b border-black/5 bg-white px-5 py-16 text-center text-sm text-[#6e5449]">
            Loading products…
          </div>
        }
      >
        <HomeProductBrowse
          categories={categories}
          products={products}
          newProducts={newProducts}
          offerProducts={offers}
          showNewProducts={settings.showNewProducts !== false}
          showOffers={settings.showOffers !== false}
        />
      </Suspense>

      {/* Image 3–5 text cards removed */}
      <DeveloperWatermark />
      <FashionFooter />
      <OrderBottomNav />
    </main>
  );
}
