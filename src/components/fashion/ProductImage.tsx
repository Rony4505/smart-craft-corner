import Image from "next/image";
import { cn } from "@/lib/fashion/cn";

export function ProductImage({
  src,
  alt,
  className,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[1.5rem] bg-[#f6ece6]", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          unoptimized={src.startsWith("/api/")}
        />
      ) : null}
    </div>
  );
}
