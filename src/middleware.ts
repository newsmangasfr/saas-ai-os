import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protection simple du dashboard par présence du cookie de session NextAuth
export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
