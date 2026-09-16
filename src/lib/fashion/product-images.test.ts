import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyProductGallery, getProductImages } from "./product-images.ts";

describe("getProductImages", () => {
  it("merges imageUrls and imageUrl without duplicates", () => {
    assert.deepEqual(
      getProductImages({
        imageUrl: "/a.jpg",
        imageUrls: ["/b.jpg", "/a.jpg", ""],
      }),
      ["/b.jpg", "/a.jpg"],
    );
  });

  it("falls back to a single imageUrl", () => {
    assert.deepEqual(getProductImages({ imageUrl: " /c.jpg " }), ["/c.jpg"]);
    assert.deepEqual(getProductImages({ imageUrl: "" }), []);
  });
});

describe("applyProductGallery", () => {
  it("uses the first image as the cover", () => {
    assert.deepEqual(applyProductGallery({ imageUrl: "" }, [" /one.jpg ", "/two.jpg", "/one.jpg"]), {
      imageUrl: "/one.jpg",
      imageUrls: ["/one.jpg", "/two.jpg"],
    });
  });
});
