export function clampProductImageScrollSeconds(value: unknown): number {
  if (value == null || value === "") return 2;
  const n = Number(value);
  if (!Number.isFinite(n)) return 2;
  return Math.min(10, Math.max(1, Math.round(n)));
}

/** When a top category is selected, only that category’s products should list. */
export function showHomeMixSections(categorySlug: string | undefined): boolean {
  return !categorySlug?.trim();
}

/** Saved address/district lock the profile until the user taps Edit. */
export function profileStartsLocked(profile: { address?: string; district?: string }): boolean {
  return Boolean(profile.address?.trim() || profile.district?.trim());
}
