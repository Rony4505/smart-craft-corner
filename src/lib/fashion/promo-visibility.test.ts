import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Product, PromoBanner } from "./types.ts";
import {
  resolvePersistedCoupons,
  syncBannersForProduct,
} from "./promo-visibility.ts";

const product: Product = {
  id: "p1",
  slug: "silk-set",
  name: "Silk Set",
  nameBn: "সিল্ক সেট",
  price: 1000,
  buyPrice: 700,
  categorySlug: "hijab",
  description: "",
  descriptionBn: "",
  fabric: "",
  sizes: ["M"],
  colors: [{ name: "Default", hex: "#fff" }],
  tone: "bg-white",
  imageUrl: "/hijab.jpg",
  stock: 5,
  inStock: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  advertiseActive: true,
  advertiseLabel: "অফার",
};

const banner: PromoBanner = {
  id: "pb-live",
  imageUrl: "/hijab.jpg",
  title: "অফার",
  linkSlug: "silk-set",
  productId: "p1",
  badgeLabel: "অফার",
  active: true,
  sortOrder: 1,
};

describe("resolvePersistedCoupons", () => {
  it("keeps an explicit empty coupon list instead of resurrecting defaults", () => {
    assert.deepEqual(resolvePersistedCoupons([]), []);
  });

  it("keeps saved coupons", () => {
    const coupons = [{ id: "cp1", code: "SAVE10", discountType: "percent" as const, discountValue: 10, active: true }];
    assert.deepEqual(resolvePersistedCoupons(coupons), coupons);
  });

  it("uses an empty list when the field is missing", () => {
    assert.deepEqual(resolvePersistedCoupons(undefined), []);
  });
});

describe("syncBannersForProduct", () => {
  it("does not recreate a deleted advertisement when the product flag is still on", () => {
    assert.deepEqual(syncBannersForProduct([], product), []);
  });

  it("updates an existing advertisement in place", () => {
    const next = syncBannersForProduct([banner], { ...product, imageUrl: "/new.jpg", advertiseLabel: "নতুন অফার" });
    assert.equal(next.length, 1);
    assert.equal(next[0].id, "pb-live");
    assert.equal(next[0].imageUrl, "/new.jpg");
    assert.equal(next[0].title, "নতুন অফার");
  });

  it("removes the linked advertisement when advertising is turned off", () => {
    assert.deepEqual(syncBannersForProduct([banner], { ...product, advertiseActive: false }), []);
  });
});
