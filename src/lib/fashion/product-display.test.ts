import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampProductImageScrollSeconds,
  profileStartsLocked,
  showHomeMixSections,
} from "./product-display.ts";

describe("clampProductImageScrollSeconds", () => {
  it("defaults to 2 seconds", () => {
    assert.equal(clampProductImageScrollSeconds(undefined), 2);
    assert.equal(clampProductImageScrollSeconds(""), 2);
    assert.equal(clampProductImageScrollSeconds("abc"), 2);
  });

  it("clamps to 1–10 seconds", () => {
    assert.equal(clampProductImageScrollSeconds(0), 1);
    assert.equal(clampProductImageScrollSeconds(2.4), 2);
    assert.equal(clampProductImageScrollSeconds(15), 10);
  });
});

describe("showHomeMixSections", () => {
  it("hides offers/new/all mix when a top category is selected", () => {
    assert.equal(showHomeMixSections("jamdani"), false);
    assert.equal(showHomeMixSections(""), true);
    assert.equal(showHomeMixSections(undefined), true);
  });
});

describe("profileStartsLocked", () => {
  it("locks after address or district is saved", () => {
    assert.equal(profileStartsLocked({}), false);
    assert.equal(profileStartsLocked({ address: "  " }), false);
    assert.equal(profileStartsLocked({ address: "Dhaka" }), true);
    assert.equal(profileStartsLocked({ district: "Khulna" }), true);
  });
});
