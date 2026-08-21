import { NextRequest, NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isPublic = pathname === "/" || pathname === "/otp";

  if (isPublic) {
    if (session) {
      return NextResponse.redirect(new URL("/board", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
