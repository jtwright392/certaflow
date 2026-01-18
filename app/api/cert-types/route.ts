import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = String(body?.name ?? "").trim()
    const renewalCadenceDays =
      body?.renewalCadenceDays === null || body?.renewalCadenceDays === undefined
        ? null
        : Number(body.renewalCadenceDays)

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (renewalCadenceDays !== null && (!Number.isFinite(renewalCadenceDays) || renewalCadenceDays <= 0)) {
      return NextResponse.json(
        { error: "renewalCadenceDays must be a positive number" },
        { status: 400 }
      )
    }

    // TEMP (until auth): pick the first org in DB
    const org = await prisma.organization.findFirst()
    if (!org) {
      return NextResponse.json({ error: "No organization found. Seed first." }, { status: 400 })
    }

    const created = await prisma.certificateType.create({
      data: {
        organizationId: org.id,
        name,
        renewalCadenceDays: renewalCadenceDays ?? undefined,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}