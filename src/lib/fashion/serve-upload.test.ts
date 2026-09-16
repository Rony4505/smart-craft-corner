import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSafeFashionUploadName } from "./upload-name.ts";

describe("isSafeFashionUploadName", () => {
  it("accepts product and profile image names", () => {
    assert.equal(isSafeFashionUploadName("fashion-171000.jpg"), true);
    assert.equal(isSafeFashionUploadName("fashion-avatar-c123-9.png"), true);
    assert.equal(isSafeFashionUploadName("avatar-c123-171000.webp"), true);
  });

  it("rejects path tricks and unknown prefixes", () => {
    assert.equal(isSafeFashionUploadName("../fashion-1.jpg"), false);
    assert.equal(isSafeFashionUploadName("user-photo.jpg"), false);
    assert.equal(isSafeFashionUploadName("fashion-1.exe"), false);
  });
});
