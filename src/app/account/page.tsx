"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FashionButton } from "@/components/fashion/FashionButton";
import { FashionShell } from "@/components/fashion/FashionShell";
import { bangladeshDistricts } from "@/lib/fashion/districts";
import { formatBdt } from "@/lib/fashion/format";
import { profileStartsLocked } from "@/lib/fashion/product-display";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type { FashionOrder, Product, UserNotification } from "@/lib/fashion/types";

type ProfileCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  district?: string;
  avatarUrl?: string;
  createdAt?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "N") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function AccountPage() {
  const router = useRouter();
  const { locale, fc } = useFashionCopy();
  const fileRef = useRef<HTMLInputElement>(null);
  const [customer, setCustomer] = useState<ProfileCustomer | null>(null);
  const [orders, setOrders] = useState<FashionOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/fashion/auth").then((r) => r.json()),
      fetch("/api/fashion/orders").then((r) => r.json()),
      fetch("/api/fashion/notifications").then((r) => r.json()),
      fetch("/api/fashion/products").then((r) => r.json()),
    ]).then(([auth, orderData, notifData, productData]) => {
      if (!auth.customer) {
        router.push("/account/login");
        return;
      }
      const next = auth.customer as ProfileCustomer;
      const nextOrders = (orderData.orders ?? []) as FashionOrder[];
      const latest = nextOrders[0];
      const merged: ProfileCustomer = {
        ...next,
        address: next.address || latest?.address || "",
        district: next.district || latest?.district || "",
      };
      setCustomer(merged);
      setEditing(!profileStartsLocked(next));
      setAvatarFailed(false);
      setOrders(nextOrders);
      setNotifications(notifData.notifications ?? []);
      setProducts(productData.products ?? []);
    });
  }, [router]);

  async function logout() {
    await fetch("/api/fashion/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!customer || !editing) return;
    setSaving(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/fashion/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-profile",
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        district: customer.district,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || fc.account.saveFailed);
      return;
    }
    setCustomer(data.customer);
    setEditing(false);
    setMessage(fc.account.saved);
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/fashion/account/avatar", { method: "POST", body });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) {
      setError(data.error || fc.account.photoFailed);
      return;
    }
    setCustomer(data.customer);
    setAvatarFailed(false);
    setMessage(fc.account.photoSet);
  }

  async function markRead(id: string) {
    await fetch("/api/fashion/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((current) =>
      current.map((n) =>
        n.id === id && customer ? { ...n, readBy: [...n.readBy, customer.id] } : n,
      ),
    );
  }

  if (!customer) return null;

  const districts = bangladeshDistricts.filter((d) => d !== "*");
  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <FashionShell>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="overflow-hidden rounded-[2.4rem] border border-[#f3c6dc]/70 bg-[linear-gradient(165deg,#8e1050_0%,#c2186b_55%,#e91e8c_100%)] p-6 text-white shadow-[0_30px_80px_rgba(194,24,107,0.22)] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <span className="relative block h-28 w-28 overflow-hidden rounded-full bg-[#fde8f2] ring-4 ring-white/30">
                  {customer.avatarUrl && !avatarFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={customer.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-4xl font-bold text-[#c2186b]">
                      {initials(customer.name)}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#c2186b]"
                >
                  {uploading ? "..." : fc.account.photo}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) void uploadAvatar(file);
                  }}
                />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold md:text-5xl">
                  {customer.name}
                </h1>
                <p className="mt-2 text-sm text-[#fde8f2]">{customer.email}</p>
                {memberSince ? (
                  <p className="mt-1 text-xs text-[#fde8f2]">{memberSince}</p>
                ) : null}
              </div>
            </div>
            <FashionButton variant="secondary" onClick={logout}>
              {fc.nav.logout}
            </FashionButton>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        {message ? (
          <p className="mt-4 rounded-2xl bg-[#fff5f8] px-4 py-3 text-sm text-[#8e1050]">{message}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <form
            onSubmit={saveProfile}
            className="space-y-4 rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(48,27,20,0.06)]"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#8e1050]">
                {fc.account.profile}
              </h2>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full border border-[#f3c6dc] bg-[#fff5f8] px-4 py-1.5 text-sm font-semibold text-[#c2186b] transition hover:bg-[#fde8f2]"
                >
                  {fc.actions.edit}
                </button>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-[#9b7766]">{fc.account.name}</span>
                <input
                  className="field mt-2"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  required
                  readOnly={!editing}
                  disabled={!editing}
                />
              </label>
              <label className="block">
                <span className="text-sm text-[#9b7766]">{fc.account.phone}</span>
                <input
                  className="field mt-2"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  required
                  readOnly={!editing}
                  disabled={!editing}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-[#9b7766]">{fc.account.gmail}</span>
                <input className="field mt-2 opacity-80" value={customer.email} readOnly />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-[#9b7766]">{fc.account.address}</span>
                <textarea
                  className="field mt-2 min-h-24"
                  value={customer.address ?? ""}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  readOnly={!editing}
                  disabled={!editing}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm text-[#9b7766]">{fc.account.district}</span>
                <select
                  className="field mt-2"
                  value={customer.district ?? ""}
                  onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                  disabled={!editing}
                >
                  <option value="">{fc.account.pickDistrict}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {editing ? (
              <FashionButton type="submit" disabled={saving}>
                {saving ? fc.account.saving : fc.account.saveProfile}
              </FashionButton>
            ) : null}
          </form>

          <div className="rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_18px_50px_rgba(48,27,20,0.06)]">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#8e1050]">
              {fc.account.notificationsTitle}
            </h2>
            {notifications.length === 0 ? (
              <p className="mt-4 text-sm text-[#6f554a]">{fc.account.noNotifications}</p>
            ) : (
              <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto">
                {notifications.slice(0, 10).map((n) => {
                  const unread = !n.readBy.includes(customer.id);
                  return (
                    <article
                      key={n.id}
                      className={`rounded-2xl border p-4 ${unread ? "border-[#d4b896]/50 bg-[#faf0ea]" : "border-black/6 bg-[#fbf7f3]"}`}
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="mt-1 text-sm text-[#6f554a]">{n.body}</p>
                      {unread ? (
                        <button
                          type="button"
                          className="mt-2 text-xs font-semibold text-[#8f624e]"
                          onClick={() => markRead(n.id)}
                        >
                          {fc.account.markRead}
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#8e1050]">
            {fc.account.ordersTitle}
          </h2>
          {orders.length === 0 ? (
            <p className="mt-4 text-[#6f554a]">{fc.account.noOrders}</p>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[1.75rem] border border-black/6 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-xs text-[#8b6456]">
                        {fc.account.tracking}: {order.trackingNumber ?? "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#8f624e]">{formatBdt(order.total)}</p>
                      <p className="text-xs text-[#6f554a]">{fc.orderStatus[order.status]}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[#6f554a]">
                    {order.address}, {order.district}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {order.items.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId);
                      return (
                        <li
                          key={`${order.id}-${item.productId}-${index}`}
                          className="flex items-center gap-3 rounded-2xl bg-[#faf4f0] px-3 py-2"
                        >
                          <span className="h-12 w-12 overflow-hidden rounded-xl bg-[#eadfd6]">
                            {product?.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="text-xs text-[#8b6456]">
                              {item.size} · {item.color} · {item.quantity} pcs
                            </p>
                          </div>
                          <p className="text-sm font-semibold">{formatBdt(item.price * item.quantity)}</p>
                        </li>
                      );
                    })}
                  </ul>
                  {order.trackingNumber ? (
                    <Link
                      href={`/track?tracking=${encodeURIComponent(order.trackingNumber)}`}
                      className="mt-3 inline-block text-xs font-semibold text-[#8f624e]"
                    >
                      {fc.account.trackOrder}
                    </Link>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </FashionShell>
  );
}
