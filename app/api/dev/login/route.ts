import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  // Example: /api/dev/login?userId=cmk... (a real User.id from your DB)
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json(
      { error: "Missing userId. Use /api/dev/login?userId=YOUR_USER_ID" },
      { status: 400 }
    )
  }

  const res = NextResponse.json({ ok: true, userId })
  res.cookies.set("dev_user_id", userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
  return res
}