import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  createCustomer,
  findCustomerByEmail,
  findCustomerById,
  verifyFashionAdminPassword,
} from "./store";

const CUSTOMER_COOKIE = "noore_session";
const ADMIN_COOKIE = "noore_admin";
const SESSION_DAYS = 14;

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.FASHION_AUTH_SECRET || "noore-dev-secret-key";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  phone: string;
  password: string;
  verified?: boolean;
  verifiedChannel?: "email" | "phone";
}) {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new Error("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে");
  }

  const customer = await createCustomer({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: await hashPassword(input.password),
    verified: input.verified,
    verifiedChannel: input.verifiedChannel,
  });

  await createCustomerSession(customer.id);
  return customer;
}

export async function loginCustomer(email: string, password: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer || !(await verifyPassword(password, customer.passwordHash))) {
    throw new Error("ইমেইল বা পাসওয়ার্ড সঠিক নয়");
  }
  await createCustomerSession(customer.id);
  return customer;
}

export async function createCustomerSession(customerId: string): Promise<void> {
  const token = await new SignJWT({ sub: customerId, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearCustomerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getCurrentCustomer() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "customer" || typeof payload.sub !== "string") return null;
    return findCustomerById(payload.sub);
  } catch {
    return null;
  }
}

export async function createFashionAdminSession(): Promise<void> {
  const token = await new SignJWT({ role: "fashion-admin", sub: "store-admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearFashionAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isFashionAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "fashion-admin";
  } catch {
    return false;
  }
}

export async function loginFashionAdmin(password: string): Promise<boolean> {
  const ok = await verifyFashionAdminPassword(password);
  if (!ok) return false;
  await createFashionAdminSession();
  return true;
}

export function sanitizeCustomer(customer: NonNullable<Awaited<ReturnType<typeof findCustomerById>>>) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address ?? "",
    district: customer.district ?? "",
    avatarUrl: customer.avatarUrl ?? "",
    verified: customer.verified,
    createdAt: customer.createdAt,
  };
}
