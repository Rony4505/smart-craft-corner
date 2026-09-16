import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/fashion/cn";

export function NoorzaaWordmark({
  className,
  priority = false,
  href = "/",
}: {
  className?: string;
  priority?: boolean;
  href?: string | null;
}) {
  const mark = (
    <Image
      src="/brand/noorzaa-wordmark-v2.png"
      alt="NOORZAA"
      width={1049}
      height={243}
      priority={priority}
      unoptimized
      className={cn(
        "h-auto w-full max-w-[20rem] object-contain object-center drop-shadow-[0_10px_24px_rgba(142,16,80,0.16)] sm:max-w-[24rem] md:max-w-[30rem] lg:max-w-[36rem]",
        className,
      )}
    />
  );

  if (!href) return mark;
  return (
    <Link href={href} aria-label="NOORZAA home" className="inline-flex justify-center">
      {mark}
    </Link>
  );
}
