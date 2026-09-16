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
      src="/brand/noorzaa-wordmark.png"
      alt="NOORZAA"
      width={1068}
      height={261}
      priority={priority}
      className={cn(
        "h-auto w-full max-w-[20rem] object-contain object-center sm:max-w-[24rem] md:max-w-[30rem] lg:max-w-[36rem]",
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
