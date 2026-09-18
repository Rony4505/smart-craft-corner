import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fashionI18n } from "./i18n.ts";

describe("fashionI18n account copy", () => {
  it("keeps Bangla and English account keys in sync", () => {
    assert.deepEqual(Object.keys(fashionI18n.bn.account), Object.keys(fashionI18n.en.account));
    assert.deepEqual(Object.keys(fashionI18n.bn.orderStatus), Object.keys(fashionI18n.en.orderStatus));
  });

  it("switches profile labels by locale", () => {
    assert.equal(fashionI18n.bn.account.profile, "প্রোফাইল");
    assert.equal(fashionI18n.en.account.profile, "Profile");
    assert.equal(fashionI18n.en.actions.edit, "Edit");
  });
});
