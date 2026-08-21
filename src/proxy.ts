import { NextRequest, NextResponse } from "next/server";
import { homeForRole, readSessionToken, SESSION_COOKIE } from "@/lib/session";

const MEMBER_GATE = ["/", "/otp"];
const ADMIN_GATE = "/admin/login";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isGate = MEMBER_GATE.includes(pathname) || pathname === ADMIN_GATE;

  if (isGate) {
    if (session) {
      return NextResponse.redirect(
        new URL(homeForRole(session.role), request.url),
      );
    }
    return NextResponse.next();
  }

  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/");

  if (!session) {
    return NextResponse.redirect(
      new URL(isAdminArea ? ADMIN_GATE : "/", request.url),
    );
  }

  if (isAdminArea && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
