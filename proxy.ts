import { NextRequest, NextResponse } from "next/server"

const ROOT_DOMAIN = process.env.ROOT_DOMAIN || "certaflow.app"
const RESERVED = new Set(["www", "app", "admin", "api", "mail"])

function getSubdomain(host: string) {
  const h = host.split(":")[0].toLowerCase()

  // local: acme.localhost
  if (h.endsWith(".localhost")) return h.replace(".localhost", "")

  // prod: acme.certaflow.com
  if (h === ROOT_DOMAIN) return null
  if (h.endsWith("." + ROOT_DOMAIN)) {
    const sub = h.slice(0, -(ROOT_DOMAIN.length + 1))
    return sub || null
  }
  return null
}

export const config = {
  matcher: ["/:path*"],
}

export default function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // skip internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const host = req.headers.get("host") || ""
  const sub = getSubdomain(host)

  if (!sub || RESERVED.has(sub)) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = `/_tenants/${sub}${pathname}`
  return NextResponse.rewrite(url)
}