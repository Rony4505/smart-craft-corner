"use client";

import { useFashionCopy } from "@/lib/fashion/use-fashion-copy";

export function ProductGridTitle({ kind }: { kind: "empty" | "related" }) {
  const { fc } = useFashionCopy();
  if (kind === "empty") return <>{fc.home.emptyCategory}</>;
  return (
    <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold text-white">{fc.home.related}</h2>
  );
}
