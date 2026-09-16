export type OtpMailPurpose = "register" | "admin-login" | "admin-reset";

export function otpFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    "Noorzaa <noreply@noorzaa.com>"
  );
}

export function resendApiKey(): string {
  return process.env.RESEND_API_KEY?.trim() || process.env.RESEND_KEY?.trim() || "";
}

/** Show the code on-screen only in local/dev, never on the live store. */
export function otpDebugEnabled(): boolean {
  if (process.env.OTP_DEBUG === "1") return true;
  if (process.env.OTP_DEBUG === "0") return false;
  return process.env.NODE_ENV !== "production";
}

export function buildOtpEmail(input: {
  code: string;
  purpose: OtpMailPurpose;
}): { subject: string; html: string; text: string } {
  const isRegister = input.purpose === "register";
  const subject = isRegister
    ? `Noorzaa OTP: ${input.code}`
    : `Noorzaa password recovery: ${input.code}`;
  const heading = isRegister ? "অ্যাকাউন্ট ভেরিফিকেশন" : "পাসওয়ার্ড রিকভারি";
  const intro = isRegister
    ? "Noorzaa-এ নতুন অ্যাকাউন্ট তৈরির জন্য আপনার OTP কোড:"
    : "Noorzaa অ্যাডমিন পাসওয়ার্ড রিসেটের জন্য আপনার OTP কোড:";
  const html = `<!DOCTYPE html>
<html lang="bn">
  <body style="margin:0;padding:24px;background:#fff5f8;font-family:Arial,sans-serif;color:#4a1235;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #f3c6dc;border-radius:16px;padding:28px;">
      <tr><td>
        <p style="margin:0 0 8px;letter-spacing:0.28em;font-size:11px;color:#c2186b;">NOORZAA</p>
        <h1 style="margin:0 0 16px;font-size:22px;color:#8e1050;">${heading}</h1>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#7a3a5c;">${intro}</p>
        <p style="margin:0 0 20px;font-size:32px;letter-spacing:0.28em;font-weight:700;color:#c2186b;">${input.code}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#9a5a78;">এই কোড ১০ মিনিটের জন্য বৈধ। আপনি এই অনুরোধ না করলে ইমেইলটি উপেক্ষা করুন।</p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `${heading}\n\n${intro} ${input.code}\n\nThis code expires in 10 minutes.`;
  return { subject, html, text };
}

export async function sendOtpEmail(input: {
  to: string;
  code: string;
  purpose: OtpMailPurpose;
}): Promise<{ id?: string }> {
  const key = resendApiKey();
  if (!key) {
    throw new Error("RESEND_API_KEY missing");
  }

  const mail = buildOtpEmail(input);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: otpFromAddress(),
      to: [input.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    const detail = payload.error?.message || payload.message || `Resend HTTP ${response.status}`;
    throw new Error(detail);
  }

  return { id: payload.id };
}

export async function deliverOtp(input: {
  channel: "email" | "phone";
  target: string;
  code: string;
  purpose: OtpMailPurpose;
}): Promise<{ delivered: boolean; debugOtp?: string }> {
  if (input.channel === "phone") {
    if (otpDebugEnabled()) {
      return { delivered: false, debugOtp: input.code };
    }
    throw new Error("ফোন OTP এখনো চালু নেই। Gmail বেছে নিন।");
  }

  try {
    await sendOtpEmail({ to: input.target, code: input.code, purpose: input.purpose });
    return {
      delivered: true,
      debugOtp: otpDebugEnabled() ? input.code : undefined,
    };
  } catch (error) {
    if (otpDebugEnabled()) {
      console.warn("[otp] email send skipped/failed in debug mode", error);
      return { delivered: false, debugOtp: input.code };
    }
    throw error;
  }
}
