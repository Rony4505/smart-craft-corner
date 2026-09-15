import { FashionFooter } from "./FashionFooter";
import { FashionHeader } from "./FashionHeader";
import { OrderBottomNav } from "./OrderBottomNav";
import { SiteEntryPopup } from "./SiteEntryPopup";
import { ChatSupportWidget } from "./ChatSupportWidget";
import { DeveloperWatermark } from "./DeveloperCredit";

export function FashionShell({
  children,
  headerVariant = "light",
}: {
  children: React.ReactNode;
  headerVariant?: "light" | "dark";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(165deg,#0a1628_0%,#0f2744_45%,#122d52_100%)] pb-20 md:pb-0">
      <ChatSupportWidget />
      <SiteEntryPopup />
      <div className={headerVariant === "dark" ? "bg-transparent" : "border-b border-white/10 bg-[linear-gradient(180deg,rgba(15,39,68,0.92)_0%,rgba(10,22,40,0.75)_100%)] px-5 py-5 md:px-8"}>
        <div className="mx-auto max-w-7xl">
          <FashionHeader variant={headerVariant} />
        </div>
      </div>
      <div className="flex-1 text-[#e8eef7]">{children}</div>
      <DeveloperWatermark />
      <FashionFooter />
      <OrderBottomNav />
    </div>
  );
}
