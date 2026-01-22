import {NextRequest, NextResponse} from 'next/server';

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
const RESERVED = new Set(["www", "app", "admin", "api", "mail", "wrightcoding"])

function getSubdomain(host: string) {
  // Remove port if present
  const h = host.split(":")[0].toLowerCase()

  // Local dev support: acme.localhost
  if (h.endsWith(".localhost")) return h.replace(".localhost", "")

  // Production: acme.certaflow.com
  if (h === ROOT_DOMAIN) return null
  if (h.endsWith("." + ROOT_DOMAIN)) {
    const sub = h.slice(0, -(ROOT_DOMAIN.length + 1))
    return sub || null
  }
  return null
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || ""
  const sub = getSubdomain(host)

  // No tenant -> marketing site or base app
  if (!sub || RESERVED.has(sub)) return NextResponse.next()

  const url = req.nextUrl
  const pathname = url.pathname

  // Don’t rewrite Next internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Rewrite /dashboard -> /_tenants/<slug>/dashboard
  url.pathname = `/_tenants/${sub}${pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
    matcher: ["/((?!_next|favicon.ico).*"]
}