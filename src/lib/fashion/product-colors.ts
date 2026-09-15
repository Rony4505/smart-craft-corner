import type { ProductColor } from "./types";

/** Preset colors admins can toggle on products; customers pick from these. */
export const DEFAULT_AVAILABLE_COLORS: ProductColor[] = [
  { name: "Black", hex: "#1c1412" },
  { name: "White", hex: "#f7f4f1" },
  { name: "Red", hex: "#b4232e" },
  { name: "Maroon", hex: "#6e1220" },
  { name: "Pink", hex: "#e8a0b8" },
  { name: "Rose", hex: "#c99286" },
  { name: "Beige", hex: "#e8d4c4" },
  { name: "Gold", hex: "#c9a05a" },
  { name: "Green", hex: "#2f6b4f" },
  { name: "Navy", hex: "#1f2a44" },
  { name: "Blue", hex: "#3d5a80" },
  { name: "Purple", hex: "#5c3d5e" },
];

export const FALLBACK_PRODUCT_COLOR: ProductColor = {
  name: "Default",
  hex: "#f8efe9",
};

export function normalizeProductColors(
  colors: ProductColor[] | undefined | null,
): ProductColor[] {
  const cleaned = (colors ?? [])
    .map((c) => ({
      name: String(c?.name ?? "").trim(),
      hex: String(c?.hex ?? "").trim() || "#f8efe9",
    }))
    .filter((c) => c.name.length > 0);

  const deduped: ProductColor[] = [];
  const seen = new Set<string>();
  for (const color of cleaned) {
    const key = color.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(color);
  }

  return deduped.length ? deduped : [FALLBACK_PRODUCT_COLOR];
}
