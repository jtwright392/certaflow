import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type ParamsCtx = { params: Promise<{ id: string }> }

export async function POST(req: Request, ctx: ParamsCtx) {
  try {
    const { id: userId } = await ctx.params
    const body = await req.json()
    const certificateTypeId = String(body?.certificateTypeId ?? "")

    if (!certificateTypeId) {
      return NextResponse.json({ error: "certificateTypeId is required" }, { status: 400 })
    }

    // ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    await prisma.certAssignment.upsert({
      where: { userId_certificateTypeId: { userId, certificateTypeId } },
      update: {},
      create: { organizationId: (await prisma.organization.findFirstOrThrow()).id, userId, certificateTypeId },
    })

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, ctx: ParamsCtx) {
  try {
    const { id: userId } = await ctx.params
    const body = await req.json()
    const certificateTypeId = String(body?.certificateTypeId ?? "")

    if (!certificateTypeId) {
      return NextResponse.json({ error: "certificateTypeId is required" }, { status: 400 })
    }

    await prisma.certAssignment.deleteMany({
      where: { userId, certificateTypeId },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}