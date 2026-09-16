import { Suspense } from "react";
import { FashionFooter } from "@/components/fashion/FashionFooter";
import { FashionHeader } from "@/components/fashion/FashionHeader";
import { HomeCategoryShowcase } from "@/components/fashion/HomeCategoryShowcase";
import { HomeProductBrowse } from "@/components/fashion/HomeProductBrowse";
import { PromoCarousel } from "@/components/fashion/PromoCarousel";
import { HomeCouponStrip } from "@/components/fashion/HomeCouponStrip";
import { ChatSupportWidget } from "@/components/fashion/ChatSupportWidget";
import { AnnouncementBar } from "@/components/fashion/AnnouncementBar";
import { OrderBottomNav } from "@/components/fashion/OrderBottomNav";
import { SiteEntryPopup } from "@/components/fashion/SiteEntryPopup";
import { fashionHeroBgClass, fashionInkClass, fashionPageBgClass } from "@/lib/fashion/theme";
import { cn } from "@/lib/fashion/cn";
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
    <main className={cn("min-h-screen pb-20 md:pb-0", fashionPageBgClass, fashionInkClass)}>
      <ChatSupportWidget />
      <SiteEntryPopup offers={offers} />
      <AnnouncementBar settings={settings} />
      <section className={cn("relative border-b border-[#f3c6dc]/70", fashionHeroBgClass)}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35),transparent_45%,rgba(233,30,140,0.08)_100%)]" />
          <div className="hero-orb absolute -left-16 top-24 h-72 w-72 rounded-full bg-[#e91e8c]/20 blur-3xl" />
          <div className="hero-drift absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#c2186b]/18 blur-3xl" />
        </div>

        <div className={cn("relative z-20 mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 md:pb-24 md:pt-10", fashionInkClass)}>
          <FashionHeader variant="light" />

          {carouselSlides.length > 0 || displayCoupons.length > 0 ? (
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
          ) : null}

          <Suspense fallback={null}>
            <HomeCategoryShowcase categories={categories} />
          </Suspense>
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
          imageScrollSeconds={settings.productImageScrollSeconds}
        />
      </Suspense>

      <FashionFooter />
      <OrderBottomNav />
    </main>
  );
}
