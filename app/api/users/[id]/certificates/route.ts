import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { id: userId } = await ctx.params
    const body = await req.json()

    const certificateTypeId = String(body?.certificateTypeId ?? "")
    const issuedAt = body?.issuedAt ? new Date(body.issuedAt) : null
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null

    if (!certificateTypeId || !expiresAt || Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json(
        { error: "certificateTypeId and a valid expiresAt are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const now = new Date()
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    const status =
      daysLeft < 0 ? "EXPIRED" : daysLeft <= 30 ? "EXPIRING" : "ACTIVE"

    const created = await prisma.userCertificate.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        certificateTypeId,
        issuedAt,
        expiresAt,
        status,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}