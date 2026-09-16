"use client";

import { useState, type FormEvent } from "react";
import { FashionButton } from "@/components/fashion/FashionButton";
import { PasswordField } from "@/components/fashion/PasswordField";
import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";
import type {
  AboutPillar,
  FaqItem,
  StoreSettings,
} from "@/lib/fashion/types";

type SettingsTab =
  | "brand"
  | "hero"
  | "contact"
  | "about"
  | "home"
  | "pricing"
  | "seo"
  | "sizes";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[#9b7766]">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function DualText({
  label,
  bn,
  en,
  onBn,
  onEn,
  multiline = false,
}: {
  label: string;
  bn: string;
  en: string;
  onBn: (v: string) => void;
  onEn: (v: string) => void;
  multiline?: boolean;
}) {
  const { fc } = useFashionCopy();
  return (
    <div className="space-y-2 rounded-xl border border-black/6 bg-white/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">{label}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold text-[#8f624e]">{fc.admin.bangla}</span>
          {multiline ? (
            <textarea className="field mt-1 min-h-[80px]" value={bn} onChange={(e) => onBn(e.target.value)} />
          ) : (
            <input className="field mt-1" value={bn} onChange={(e) => onBn(e.target.value)} />
          )}
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold text-[#8f624e]">{fc.admin.english}</span>
          {multiline ? (
            <textarea className="field mt-1 min-h-[80px]" value={en} onChange={(e) => onEn(e.target.value)} />
          ) : (
            <input className="field mt-1" value={en} onChange={(e) => onEn(e.target.value)} />
          )}
        </label>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-black/6 bg-white/70 px-4 py-3">
      <span className="text-sm text-[#3d2a24]">{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 accent-[#8b6456]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}

export function SettingsEditor({
  settings,
  setSettings,
  onSave,
  newSize,
  setNewSize,
  onAddSize,
  onRemoveSize,
}: {
  settings: StoreSettings;
  setSettings: (next: StoreSettings) => void;
  onSave: () => void;
  newSize: string;
  setNewSize: (v: string) => void;
  onAddSize: () => void;
  onRemoveSize: (size: string) => void;
}) {
  const { fc } = useFashionCopy();
  const [tab, setTab] = useState<SettingsTab>("brand");

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "brand", label: fc.admin.settingsBrand },
    { id: "hero", label: fc.admin.settingsHero },
    { id: "contact", label: fc.admin.settingsContact },
    { id: "about", label: fc.admin.settingsAbout },
    { id: "home", label: fc.admin.settingsHome },
    { id: "pricing", label: fc.admin.settingsPricing },
    { id: "seo", label: fc.admin.settingsSeo },
    { id: "sizes", label: fc.admin.settingsSizes },
  ];

  function patch<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings({ ...settings, [key]: value });
  }

  function updatePillar(index: number, key: keyof AboutPillar, value: string, lang: "bn" | "en") {
    if (lang === "en") {
      const pillars = [...(settings.aboutPillarsEn ?? settings.aboutPillars ?? [])];
      while (pillars.length <= index) pillars.push({ title: "", body: "" });
      pillars[index] = { ...pillars[index], [key]: value };
      patch("aboutPillarsEn", pillars);
      return;
    }
    const pillars = [...(settings.aboutPillars ?? [])];
    pillars[index] = { ...pillars[index], [key]: value };
    patch("aboutPillars", pillars);
  }

  function updateHighlight(index: number, value: string, lang: "bn" | "en") {
    if (lang === "en") {
      const items = [...(settings.serviceHighlightsEn ?? [])];
      while (items.length <= index) items.push("");
      items[index] = value;
      patch("serviceHighlightsEn", items);
      return;
    }
    const items = [...(settings.serviceHighlights ?? [])];
    items[index] = value;
    patch("serviceHighlights", items);
  }

  function updateFaq(index: number, key: keyof FaqItem, value: string, lang: "bn" | "en") {
    if (lang === "en") {
      const items = [...(settings.faqsEn ?? [])];
      while (items.length <= index) items.push({ question: "", answer: "" });
      items[index] = { ...items[index], [key]: value };
      patch("faqsEn", items);
      return;
    }
    const items = [...(settings.faqs ?? [])];
    items[index] = { ...items[index], [key]: value };
    patch("faqs", items);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#7a5c50]">
        প্রতিটি লেখার জন্য বাংলা ও English আলাদা রাখুন — language switch করলে সাইটে সেই ভাষা দেখাবে।
      </p>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-[#2b1d19] text-white"
                : "border border-[#c9a890] bg-[#f3ebe4] text-[#1c1412] hover:bg-[#ebe0d6]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "brand" ? (
        <div className="space-y-3">
          <Field label="Brand name">
            <input
              className="field"
              value={settings.brandName}
              onChange={(e) => patch("brandName", e.target.value)}
            />
          </Field>
          <DualText
            label="Tagline"
            bn={settings.brandTagline}
            en={settings.brandTaglineEn ?? ""}
            onBn={(v) => patch("brandTagline", v)}
            onEn={(v) => patch("brandTaglineEn", v)}
          />
          <DualText
            label="Announcement"
            bn={settings.announcementText ?? ""}
            en={settings.announcementTextEn ?? ""}
            onBn={(v) => patch("announcementText", v)}
            onEn={(v) => patch("announcementTextEn", v)}
          />
          <Toggle
            label="Announcement দেখাও"
            checked={Boolean(settings.announcementEnabled)}
            onChange={(v) => patch("announcementEnabled", v)}
          />
          <DualText
            label="Free shipping note"
            bn={settings.freeShippingNote ?? ""}
            en={settings.freeShippingNoteEn ?? ""}
            onBn={(v) => patch("freeShippingNote", v)}
            onEn={(v) => patch("freeShippingNoteEn", v)}
          />
          <div className="space-y-3 rounded-xl border border-black/6 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">
              Admin login & recovery
            </p>
            <p className="text-sm text-[#7a5c50]">
              লগইনে OTP লাগবে না। Forget password-এর জন্য নিজের Gmail সেট করুন।
            </p>
            <Field label="Admin username">
              <input
                className="field"
                value={settings.adminUsername ?? "founder"}
                onChange={(e) => patch("adminUsername", e.target.value)}
              />
            </Field>
            <Field label="Recovery Gmail (forgot password)">
              <input
                className="field"
                type="email"
                value={settings.adminRecoveryEmail ?? ""}
                onChange={(e) => patch("adminRecoveryEmail", e.target.value)}
                placeholder="you@gmail.com"
              />
            </Field>
            <AdminPasswordChange />
          </div>
        </div>
      ) : null}

      {tab === "hero" ? (
        <div className="space-y-3">
          <DualText
            label="Hero subtitle"
            bn={settings.heroSubtitle ?? ""}
            en={settings.heroSubtitleEn ?? ""}
            onBn={(v) => patch("heroSubtitle", v)}
            onEn={(v) => patch("heroSubtitleEn", v)}
          />
          <DualText
            label="Hero title"
            bn={settings.heroTitle ?? ""}
            en={settings.heroTitleEn ?? ""}
            onBn={(v) => patch("heroTitle", v)}
            onEn={(v) => patch("heroTitleEn", v)}
            multiline
          />
          <DualText
            label="Hero description"
            bn={settings.heroDescription ?? ""}
            en={settings.heroDescriptionEn ?? ""}
            onBn={(v) => patch("heroDescription", v)}
            onEn={(v) => patch("heroDescriptionEn", v)}
            multiline
          />
          <DualText
            label="Primary CTA label"
            bn={settings.heroCtaPrimaryLabel ?? ""}
            en={settings.heroCtaPrimaryLabelEn ?? ""}
            onBn={(v) => patch("heroCtaPrimaryLabel", v)}
            onEn={(v) => patch("heroCtaPrimaryLabelEn", v)}
          />
          <Field label="Primary CTA link">
            <input
              className="field"
              value={settings.heroCtaPrimaryHref ?? ""}
              onChange={(e) => patch("heroCtaPrimaryHref", e.target.value)}
            />
          </Field>
          <DualText
            label="Secondary CTA (Featured) label"
            bn={settings.heroCtaSecondaryLabel ?? ""}
            en={settings.heroCtaSecondaryLabelEn ?? ""}
            onBn={(v) => patch("heroCtaSecondaryLabel", v)}
            onEn={(v) => patch("heroCtaSecondaryLabelEn", v)}
          />
          <Field label="Secondary CTA link">
            <input
              className="field"
              value={settings.heroCtaSecondaryHref ?? ""}
              onChange={(e) => patch("heroCtaSecondaryHref", e.target.value)}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["heroStat1Value", "heroStat1Label", "heroStat1LabelEn", "Stat 1"],
                ["heroStat2Value", "heroStat2Label", "heroStat2LabelEn", "Stat 2"],
                ["heroStat3Value", "heroStat3Label", "heroStat3LabelEn", "Stat 3"],
              ] as const
            ).map(([valueKey, labelKey, labelEnKey, title]) => (
              <div key={title} className="space-y-2 rounded-xl border border-black/6 bg-white/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">{title}</p>
                <input
                  className="field"
                  placeholder="Value"
                  value={String(settings[valueKey] ?? "")}
                  onChange={(e) => patch(valueKey, e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Label (বাংলা)"
                  value={String(settings[labelKey] ?? "")}
                  onChange={(e) => patch(labelKey, e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Label (English)"
                  value={String(settings[labelEnKey] ?? "")}
                  onChange={(e) => patch(labelEnKey, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "contact" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone">
            <input
              className="field"
              value={settings.contactPhone ?? ""}
              onChange={(e) => patch("contactPhone", e.target.value)}
            />
          </Field>
          <Field label="WhatsApp (digits)">
            <input
              className="field"
              value={settings.whatsapp ?? ""}
              onChange={(e) => patch("whatsapp", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className="field"
              value={settings.contactEmail ?? ""}
              onChange={(e) => patch("contactEmail", e.target.value)}
            />
          </Field>
          <Field label="Facebook URL">
            <input
              className="field"
              value={settings.facebookUrl ?? ""}
              onChange={(e) => patch("facebookUrl", e.target.value)}
            />
          </Field>
          <Field label="Instagram URL">
            <input
              className="field"
              value={settings.instagramUrl ?? ""}
              onChange={(e) => patch("instagramUrl", e.target.value)}
            />
          </Field>
          <div className="sm:col-span-2">
            <DualText
              label="Support note"
              bn={settings.supportNote ?? ""}
              en={settings.supportNoteEn ?? ""}
              onBn={(v) => patch("supportNote", v)}
              onEn={(v) => patch("supportNoteEn", v)}
            />
          </div>
          <div className="sm:col-span-2">
            <DualText
              label="Footer text"
              bn={settings.footerText ?? ""}
              en={settings.footerTextEn ?? ""}
              onBn={(v) => patch("footerText", v)}
              onEn={(v) => patch("footerTextEn", v)}
              multiline
            />
          </div>
        </div>
      ) : null}

      {tab === "about" ? (
        <div className="space-y-3">
          <DualText
            label="About subtitle"
            bn={settings.aboutSubtitle ?? ""}
            en={settings.aboutSubtitleEn ?? ""}
            onBn={(v) => patch("aboutSubtitle", v)}
            onEn={(v) => patch("aboutSubtitleEn", v)}
          />
          <DualText
            label="About title"
            bn={settings.aboutTitle ?? ""}
            en={settings.aboutTitleEn ?? ""}
            onBn={(v) => patch("aboutTitle", v)}
            onEn={(v) => patch("aboutTitleEn", v)}
          />
          <DualText
            label="About body"
            bn={settings.aboutText ?? ""}
            en={settings.aboutTextEn ?? ""}
            onBn={(v) => patch("aboutText", v)}
            onEn={(v) => patch("aboutTextEn", v)}
            multiline
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">Pillars</p>
          {(settings.aboutPillars ?? []).map((pillar, index) => (
            <div key={index} className="space-y-2 rounded-xl border border-black/6 bg-white/60 p-3">
              <DualText
                label={`Pillar ${index + 1} title`}
                bn={pillar.title}
                en={settings.aboutPillarsEn?.[index]?.title ?? ""}
                onBn={(v) => updatePillar(index, "title", v, "bn")}
                onEn={(v) => updatePillar(index, "title", v, "en")}
              />
              <DualText
                label={`Pillar ${index + 1} body`}
                bn={pillar.body}
                en={settings.aboutPillarsEn?.[index]?.body ?? ""}
                onBn={(v) => updatePillar(index, "body", v, "bn")}
                onEn={(v) => updatePillar(index, "body", v, "en")}
                multiline
              />
            </div>
          ))}
        </div>
      ) : null}

      {tab === "home" ? (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle
              label="Homepage-এ কুপন দেখাও"
              checked={settings.showCouponsOnHome !== false}
              onChange={(v) => patch("showCouponsOnHome", v)}
            />
            <Toggle
              label="New products সেকশন"
              checked={settings.showNewProducts !== false}
              onChange={(v) => patch("showNewProducts", v)}
            />
            <Toggle
              label="Offers সেকশন"
              checked={settings.showOffers !== false}
              onChange={(v) => patch("showOffers", v)}
            />
            <Toggle
              label="Features / Why shoppers stay"
              checked={settings.showFeatures !== false}
              onChange={(v) => patch("showFeatures", v)}
            />
            <Toggle
              label="FAQ সেকশন"
              checked={settings.showFaq !== false}
              onChange={(v) => patch("showFaq", v)}
            />
          </div>

          <DualText
            label="Features title"
            bn={settings.featuresTitle ?? ""}
            en={settings.featuresTitleEn ?? ""}
            onBn={(v) => patch("featuresTitle", v)}
            onEn={(v) => patch("featuresTitleEn", v)}
          />
          <DualText
            label="Features body"
            bn={settings.featuresBody ?? ""}
            en={settings.featuresBodyEn ?? ""}
            onBn={(v) => patch("featuresBody", v)}
            onEn={(v) => patch("featuresBodyEn", v)}
            multiline
          />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">
              Service highlights
            </p>
            {(settings.serviceHighlights ?? []).map((item, index) => (
              <DualText
                key={index}
                label={`Highlight ${index + 1}`}
                bn={item}
                en={settings.serviceHighlightsEn?.[index] ?? ""}
                onBn={(v) => updateHighlight(index, v, "bn")}
                onEn={(v) => updateHighlight(index, v, "en")}
              />
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">FAQ</p>
            {(settings.faqs ?? []).map((item, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-black/6 bg-white/60 p-3">
                <DualText
                  label="Question"
                  bn={item.question}
                  en={settings.faqsEn?.[index]?.question ?? ""}
                  onBn={(v) => updateFaq(index, "question", v, "bn")}
                  onEn={(v) => updateFaq(index, "question", v, "en")}
                />
                <DualText
                  label="Answer"
                  bn={item.answer}
                  en={settings.faqsEn?.[index]?.answer ?? ""}
                  onBn={(v) => updateFaq(index, "answer", v, "bn")}
                  onEn={(v) => updateFaq(index, "answer", v, "en")}
                  multiline
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "pricing" ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Default pricing mode">
              <select
                className="field"
                value={settings.pricingMode}
                onChange={(e) =>
                  patch("pricingMode", e.target.value as StoreSettings["pricingMode"])
                }
              >
                <option value="markup">Markup %</option>
                <option value="manual">Manual</option>
              </select>
            </Field>
            <Field label="Default markup %">
              <input
                className="field"
                type="number"
                min={0}
                value={settings.defaultMarkupPercent}
                onChange={(e) => patch("defaultMarkupPercent", Number(e.target.value) || 0)}
              />
            </Field>
          </div>

          <div className="space-y-3 rounded-xl border border-black/6 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">
              Top Buying User (VIP) discount
            </p>
            <Toggle
              label="VIP discount চালু"
              checked={settings.vipEnabled !== false}
              onChange={(v) => patch("vipEnabled", v)}
            />
            <Field label="মিনিমাম মোট কেনাকাটা (৳) — এত টাকার বেশি কিনলে VIP">
              <input
                className="field"
                type="number"
                min={0}
                value={settings.vipMinSpend ?? 0}
                onChange={(e) => patch("vipMinSpend", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="VIP discount %">
              <input
                className="field"
                type="number"
                min={0}
                max={100}
                value={settings.vipDiscountPercent ?? 0}
                onChange={(e) => patch("vipDiscountPercent", Number(e.target.value) || 0)}
              />
            </Field>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="space-y-3">
          <DualText
            label="Meta title"
            bn={settings.metaTitle ?? ""}
            en={settings.metaTitleEn ?? ""}
            onBn={(v) => patch("metaTitle", v)}
            onEn={(v) => patch("metaTitleEn", v)}
          />
          <DualText
            label="Meta description"
            bn={settings.metaDescription ?? ""}
            en={settings.metaDescriptionEn ?? ""}
            onBn={(v) => patch("metaDescription", v)}
            onEn={(v) => patch("metaDescriptionEn", v)}
            multiline
          />
        </div>
      ) : null}

      {tab === "sizes" ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="নতুন সাইজ (যেমন XXL)"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
            />
            <FashionButton variant="secondary" onClick={onAddSize}>
              যোগ
            </FashionButton>
          </div>
          <div className="flex flex-wrap gap-2">
            {(settings.availableSizes ?? []).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onRemoveSize(size)}
                className="rounded-full border border-black/8 bg-white px-3 py-1.5 text-sm text-[#5b4339]"
              >
                {size} ×
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="sticky bottom-0 border-t border-black/5 bg-white/80 pt-4 backdrop-blur">
        <FashionButton onClick={onSave}>{fc.admin.settingsSaveAll}</FashionButton>
      </div>
    </div>
  );
}

function AdminPasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/fashion/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "change-password",
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "পাসওয়ার্ড আপডেট হয়নি");
      return;
    }
    setMessage("নতুন পাসওয়ার্ড সেভ হয়েছে");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t border-black/6 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#9b7766]">
        Change password
      </p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {message ? <p className="text-sm text-[#2f6b4f]">{message}</p> : null}
      <PasswordField
        label="Current password"
        value={currentPassword}
        onChange={setCurrentPassword}
        required
      />
      <PasswordField
        label="New password"
        value={newPassword}
        onChange={setNewPassword}
        required
      />
      <FashionButton type="submit" variant="secondary" disabled={loading}>
        {loading ? "..." : "Update password"}
      </FashionButton>
    </form>
  );
}
