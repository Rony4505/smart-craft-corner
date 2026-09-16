import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isGmailAddress,
  maskEmail,
  normalizeEmail,
  recoveryEmailsMatch,
} from "./admin-security.ts";

describe("admin recovery email helpers", () => {
  it("accepts gmail addresses only", () => {
    assert.equal(isGmailAddress("Founder@Gmail.com"), true);
    assert.equal(isGmailAddress("founder@googlemail.com"), false);
    assert.equal(isGmailAddress("hello@noorzaa.com"), false);
    assert.equal(isGmailAddress(""), false);
  });

  it("matches saved recovery email case-insensitively", () => {
    assert.equal(recoveryEmailsMatch("me@gmail.com", "ME@gmail.com"), true);
    assert.equal(recoveryEmailsMatch(undefined, "me@gmail.com"), false);
    assert.equal(recoveryEmailsMatch("", "me@gmail.com"), false);
    assert.equal(recoveryEmailsMatch("old@gmail.com", "new@gmail.com"), false);
  });

  it("masks an address for UI hints", () => {
    assert.equal(maskEmail("founder@gmail.com"), "fo***@gmail.com");
    assert.equal(normalizeEmail("  Me@Gmail.com "), "me@gmail.com");
  });
});
