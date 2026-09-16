import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOtpEmail,
  deliverOtp,
  otpDebugEnabled,
  otpFromAddress,
} from "./mail.ts";

function restoreEnv(name: string, previous: string | undefined) {
  if (previous === undefined) delete process.env[name];
  else process.env[name] = previous;
}

describe("buildOtpEmail", () => {
  it("includes the OTP and Noorzaa brand for registration", () => {
    const mail = buildOtpEmail({ code: "123456", purpose: "register" });
    assert.match(mail.subject, /123456/);
    assert.match(mail.html, /NOORZAA/);
    assert.match(mail.html, /123456/);
    assert.match(mail.text, /123456/);
  });

  it("uses magenta recovery copy for admin password reset", () => {
    const mail = buildOtpEmail({ code: "654321", purpose: "admin-reset" });
    assert.match(mail.subject, /654321/);
    assert.match(mail.html, /#c2186b/);
    assert.match(mail.html, /পাসওয়ার্ড রিকভারি/);
    assert.doesNotMatch(mail.html, /অ্যাডমিন লগইন/);
  });
});

describe("otp debug vs live", () => {
  it("does not expose OTP on screen in production unless OTP_DEBUG=1", () => {
    const previousNode = process.env.NODE_ENV;
    const previousDebug = process.env.OTP_DEBUG;
    process.env.NODE_ENV = "production";
    delete process.env.OTP_DEBUG;
    assert.equal(otpDebugEnabled(), false);
    restoreEnv("OTP_DEBUG", previousDebug);
    restoreEnv("NODE_ENV", previousNode);
  });
});

describe("otpFromAddress", () => {
  it("defaults to the Noorzaa sending address", () => {
    const previousFrom = process.env.RESEND_FROM_EMAIL;
    const previousEmailFrom = process.env.EMAIL_FROM;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.EMAIL_FROM;
    assert.match(otpFromAddress(), /noorzaa.com/i);
    restoreEnv("RESEND_FROM_EMAIL", previousFrom);
    restoreEnv("EMAIL_FROM", previousEmailFrom);
  });
});

describe("deliverOtp", () => {
  it("returns debugOtp when Resend is unset in development", async () => {
    const previousNode = process.env.NODE_ENV;
    const previousDebug = process.env.OTP_DEBUG;
    const previousKey = process.env.RESEND_API_KEY;
    const previousAlt = process.env.RESEND_KEY;
    process.env.NODE_ENV = "development";
    delete process.env.OTP_DEBUG;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_KEY;
    const result = await deliverOtp({
      channel: "email",
      target: "new.user@gmail.com",
      code: "654321",
      purpose: "register",
    });
    assert.equal(result.delivered, false);
    assert.equal(result.debugOtp, "654321");
    restoreEnv("NODE_ENV", previousNode);
    restoreEnv("OTP_DEBUG", previousDebug);
    restoreEnv("RESEND_API_KEY", previousKey);
    restoreEnv("RESEND_KEY", previousAlt);
  });

  it("fails closed in production when Resend is unset", async () => {
    const previousNode = process.env.NODE_ENV;
    const previousDebug = process.env.OTP_DEBUG;
    const previousKey = process.env.RESEND_API_KEY;
    const previousAlt = process.env.RESEND_KEY;
    process.env.NODE_ENV = "production";
    delete process.env.OTP_DEBUG;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_KEY;
    await assert.rejects(
      () =>
        deliverOtp({
          channel: "email",
          target: "new.user@gmail.com",
          code: "654321",
          purpose: "register",
        }),
      /RESEND_API_KEY missing/,
    );
    restoreEnv("NODE_ENV", previousNode);
    restoreEnv("OTP_DEBUG", previousDebug);
    restoreEnv("RESEND_API_KEY", previousKey);
    restoreEnv("RESEND_KEY", previousAlt);
  });
});
