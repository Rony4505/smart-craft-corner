import { FashionFooter } from "./FashionFooter";
import { FashionHeader } from "./FashionHeader";
import { OrderBottomNav } from "./OrderBottomNav";
import { SiteEntryPopup } from "./SiteEntryPopup";
import { ChatSupportWidget } from "./ChatSupportWidget";
import { DeveloperWatermark } from "./DeveloperCredit";
import { fashionHeroBgClass, fashionInkClass, fashionPageBgClass } from "@/lib/fashion/theme";
import { cn } from "@/lib/fashion/cn";

export function FashionShell({
  children,
  headerVariant = "light",
}: {
  children: React.ReactNode;
  headerVariant?: "light" | "dark";
}) {
  return (
    <div className={cn("flex min-h-screen flex-col pb-20 md:pb-0", fashionPageBgClass, fashionInkClass)}>
      <ChatSupportWidget />
      <SiteEntryPopup />
      <div
        className={
          headerVariant === "dark"
            ? "bg-transparent"
            : cn("border-b border-[#f3c6dc]/70 px-5 py-5 md:px-8", fashionHeroBgClass)
        }
      >
        <div className="mx-auto max-w-7xl">
          <FashionHeader variant={headerVariant} />
        </div>
      </div>
      <div className={cn("flex-1", fashionInkClass)}>{children}</div>
      <DeveloperWatermark />
      <FashionFooter />
      <OrderBottomNav />
    </div>
  );
}
