import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Keep old /shop URLs pointed at the Noorzaa storefront. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/shop" || pathname === "/shop/") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (pathname === "/shop/about" || pathname.startsWith("/shop/about/")) {
    return NextResponse.redirect(new URL("/about", request.url));
  }
  if (pathname === "/shop/contact" || pathname.startsWith("/shop/contact/")) {
    return NextResponse.redirect(new URL("/contact", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shop", "/shop/:path*"],
};
