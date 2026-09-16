import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fashionDataDir } from "./paths";

type OtpRecord = {
  code: string;
  channel: "email" | "phone";
  target: string;
  purpose: string;
  expiresAt: number;
};

function otpPath(): string {
  return path.join(/* turbopackIgnore: true */ fashionDataDir(), "fashion-otp.json");
}

async function readAll(): Promise<Record<string, OtpRecord>> {
  try {
    const raw = await readFile(otpPath(), "utf8");
    return JSON.parse(raw) as Record<string, OtpRecord>;
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, OtpRecord>) {
  await mkdir(fashionDataDir(), { recursive: true });
  await writeFile(otpPath(), JSON.stringify(data, null, 2), "utf8");
}

function keyFor(purpose: string, target: string) {
  return `${purpose}:${target.trim().toLowerCase()}`;
}

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Create and store OTP. Returns code for delivery / debug display. */
export async function issueOtp(input: {
  purpose: string;
  channel: "email" | "phone";
  target: string;
  ttlMinutes?: number;
}): Promise<{ code: string; expiresAt: number }> {
  const code = generateOtpCode();
  const expiresAt = Date.now() + (input.ttlMinutes ?? 10) * 60 * 1000;
  const all = await readAll();
  all[keyFor(input.purpose, input.target)] = {
    code,
    channel: input.channel,
    target: input.target.trim(),
    purpose: input.purpose,
    expiresAt,
  };
  await writeAll(all);
  if (process.env.NODE_ENV !== "production" || process.env.OTP_DEBUG === "1") {
    console.info(`[otp] ${input.purpose} → ${input.channel}:${input.target}`);
  }
  return { code, expiresAt };
}

export async function verifyOtp(input: {
  purpose: string;
  target: string;
  code: string;
}): Promise<boolean> {
  const all = await readAll();
  const key = keyFor(input.purpose, input.target);
  const record = all[key];
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    delete all[key];
    await writeAll(all);
    return false;
  }
  if (record.code !== String(input.code).trim()) return false;
  delete all[key];
  await writeAll(all);
  return true;
}
