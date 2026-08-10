import { NextRequest, NextResponse } from "next/server";

const REALM = "Vikingaheimar Control Room";

export function middleware(req: NextRequest) {
  const user = process.env.CONTROL_ROOM_USER;
  const pass = process.env.CONTROL_ROOM_PASS;

  if (!user || !pass) {
    return new NextResponse("Auth not configured", { status: 503 });
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx !== -1) {
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"` },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/control-room/:path*", "/revenue/:path*"],
};
