export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const org = await prisma.organization.findFirst()
    if (!org) {
      return NextResponse.json({ error: "No organization found." }, { status: 400 })
    }

    const cert = await prisma.certificateType.findFirst({
      where: { id, organizationId: org.id },
      select: { id: true },
    })

    if (!cert) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.certificateType.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}