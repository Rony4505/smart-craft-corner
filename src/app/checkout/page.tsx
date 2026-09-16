"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FashionButton } from "@/components/fashion/FashionButton";
import { FashionShell } from "@/components/fashion/FashionShell";
import { copy } from "@/lib/fashion/copy";
import { formatBdt } from "@/lib/fashion/format";
import { useCart } from "@/lib/fashion/cart-context";
import { bangladeshDistricts } from "@/lib/fashion/districts";
import type { CheckoutForm, FashionOrder } from "@/lib/fashion/types";

const districts = bangladeshDistricts.filter((d) => d !== "*");

const initialForm: CheckoutForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  district: "Dhaka",
  note: "",
  paymentMethod: "cod",
  couponCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [shipping, setShipping] = useState(120);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [vipDiscount, setVipDiscount] = useState(0);
  const [vipMessage, setVipMessage] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const discount = couponDiscount + vipDiscount;
  const total = Math.max(0, subtotal - discount) + shipping;
  const filteredDistricts = districts.filter((d) =>
    !districtSearch.trim()
      ? true
      : d.toLowerCase().includes(districtSearch.trim().toLowerCase()),
  );

  useEffect(() => {
    fetch("/api/fashion/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setForm((current) => ({
            ...current,
            name: data.customer.name,
            phone: data.customer.phone,
            email: data.customer.email,
          }));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch(`/api/fashion/vip?subtotal=${subtotal}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.vip?.eligible) {
          setVipDiscount(data.vip.amount ?? 0);
          setVipMessage(
            `Top buyer VIP ${data.vip.percent}% · lifetime ৳${data.vip.spent?.toLocaleString?.() ?? data.vip.spent}`,
          );
        } else {
          setVipDiscount(0);
          setVipMessage(
            data.vip?.minSpend
              ? `VIP unlocks after ৳${data.vip.minSpend.toLocaleString()} lifetime spend (now ৳${data.vip.spent ?? 0})`
              : "",
          );
        }
      })
      .catch(() => {
        setVipDiscount(0);
        setVipMessage("");
      });
  }, [subtotal]);

  useEffect(() => {
    fetch("/api/fashion/delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ district: form.district, subtotal: Math.max(0, subtotal - discount) }),
    })
      .then((r) => r.json())
      .then((data) => setShipping(data.fee ?? 120))
      .catch(() => setShipping(120));
  }, [form.district, subtotal, discount]);

  async function applyCoupon() {
    if (!form.couponCode?.trim()) return;
    const res = await fetch("/api/fashion/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: form.couponCode, subtotal }),
    });
    const data = await res.json();
    if (data.valid) {
      setCouponDiscount(data.discount);
      setCouponMessage(`কুপন প্রয়োগ: ${data.coupon.code}`);
    } else {
      setCouponDiscount(0);
      setCouponMessage(data.error ?? "কুপন সঠিক নয়");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (items.length === 0) return;

    setSubmitting(true);
    const res = await fetch("/api/fashion/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form, items }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setCouponMessage(data.error ?? "অর্ডার করা যায়নি");
      return;
    }

    const order = data.order as FashionOrder;
    sessionStorage.setItem("scc_last_order", JSON.stringify(order));
    clearCart();
    router.push(`/checkout/success?orderId=${order.id}`);
  }

  if (items.length === 0) {
    return (
      <FashionShell>
        <section className="mx-auto max-w-3xl px-5 py-20 text-center md:px-8">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold">
            {copy.checkout.title}
          </h1>
          <p className="mt-4 text-lg text-[#6f554a]">{copy.cart.empty}</p>
          <div className="mt-8">
            <FashionButton href="/collections">{copy.actions.continueShopping}</FashionButton>
          </div>
        </section>
      </FashionShell>
    );
  }

  return (
    <FashionShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold md:text-6xl">
            {copy.checkout.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 rounded-[2rem] border border-black/6 bg-white p-6 shadow-[0_24px_80px_rgba(48,27,20,0.06)]">
            <Field label={copy.form.name} value={form.name} onChange={(value) => setForm((c) => ({ ...c, name: value }))} required />
            <Field label={copy.form.phone} value={form.phone} onChange={(value) => setForm((c) => ({ ...c, phone: value }))} required />
            <Field label={copy.form.email} value={form.email} onChange={(value) => setForm((c) => ({ ...c, email: value }))} type="email" />
            <Field label={copy.form.address} value={form.address} onChange={(value) => setForm((c) => ({ ...c, address: value }))} required multiline />
            <div>
              <label className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">{copy.form.district}</label>
              <input
                className="field mt-2"
                placeholder="জেলা সার্চ..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
              />
              <select
                className="field mt-2"
                value={form.district}
                onChange={(e) => setForm((c) => ({ ...c, district: e.target.value }))}
                size={Math.min(8, Math.max(4, filteredDistricts.length))}
              >
                {filteredDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <Field label={copy.form.note} value={form.note} onChange={(value) => setForm((c) => ({ ...c, note: value }))} multiline />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">{copy.cart.coupon}</p>
              <div className="mt-2 flex gap-2">
                <input
                  className="field flex-1"
                  value={form.couponCode ?? ""}
                  onChange={(e) => setForm((c) => ({ ...c, couponCode: e.target.value }))}
                  placeholder="COUPON10"
                />
                <FashionButton type="button" variant="secondary" onClick={applyCoupon}>{copy.actions.apply}</FashionButton>
              </div>
              {couponMessage ? <p className="mt-2 text-sm text-[#8b6456]">{couponMessage}</p> : null}
              {vipMessage ? <p className="mt-2 text-sm text-[#4a7350]">{vipMessage}</p> : null}
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">{copy.form.payment}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  ["cod", copy.form.cod],
                  ["bkash", copy.form.bkash],
                  ["nagad", copy.form.nagad],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, paymentMethod: value as CheckoutForm["paymentMethod"] }))}
                    className={`rounded-[1.25rem] border px-4 py-4 text-sm font-semibold transition ${
                      form.paymentMethod === value
                        ? "border-[#c2186b] bg-[linear-gradient(135deg,#c2186b,#e91e8c)] text-white"
                        : "border-[#f3c6dc] bg-[#fff5f8] text-[#8e1050]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-[#f3c6dc] bg-[linear-gradient(165deg,#8e1050,#c2186b)] p-6 text-white shadow-[0_30px_90px_rgba(194,24,107,0.18)]">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold">{copy.cart.summary}</h2>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.key} className="flex justify-between gap-4 text-sm text-white/78">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatBdt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-white/10 pt-4 text-white/78">
              <div className="flex justify-between"><span>{copy.cart.subtotal}</span><span>{formatBdt(subtotal)}</span></div>
              {discount > 0 ? (
                <div className="flex justify-between"><span>{copy.cart.discount}</span><span>-{formatBdt(discount)}</span></div>
              ) : null}
              <div className="flex justify-between"><span>{copy.cart.shipping}</span><span>{shipping === 0 ? "Free" : formatBdt(shipping)}</span></div>
              <div className="flex justify-between text-lg font-semibold text-white"><span>{copy.cart.total}</span><span>{formatBdt(total)}</span></div>
            </div>
            <div className="mt-8">
              <FashionButton type="submit" disabled={submitting}>
                {submitting ? "অর্ডার হচ্ছে..." : copy.actions.placeOrder}
              </FashionButton>
            </div>
          </aside>
        </form>
      </section>
    </FashionShell>
  );
}

function Field({ label, value, onChange, required, type = "text", multiline }: {
  label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium uppercase tracking-[0.2em] text-[#9b7766]">{label}</label>
      {multiline ? (
        <textarea className="field mt-2 min-h-28 resize-y" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      ) : (
        <input className="field mt-2" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </div>
  );
}
