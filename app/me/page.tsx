import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UploadCertDialog } from "./UploadCertDialog"

function StatusBadge({ status }: { status: "ACTIVE" | "EXPIRING" | "EXPIRED" | "MISSING" }) {
  if (status === "ACTIVE") return <Badge variant="secondary">Active</Badge>
  if (status === "EXPIRING") return <Badge>Expiring</Badge>
  if (status === "EXPIRED") return <Badge variant="destructive">Expired</Badge>
  return <Badge variant="outline">Missing</Badge>
}

export default async function MePage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>
}) {
  const { userId: userIdFromQuery } = await searchParams

  const org = await prisma.organization.findFirst()
  if (!org) return <div className="p-8">No organization found.</div>

  const me =
    (userIdFromQuery
      ? await prisma.user.findUnique({
          where: { id: userIdFromQuery },
          select: { id: true, email: true, firstName: true, lastName: true, organizationId: true },
        })
      : null) ??
    (await prisma.user.findFirst({
      where: { organizationId: org.id, role: "USER" },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true, organizationId: true },
    })) ??
    (await prisma.user.findFirst({
      where: { organizationId: org.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, firstName: true, lastName: true, organizationId: true },
    }))

  if (!me) return <div className="p-8">No users found.</div>

  const [assignments, certs] = await Promise.all([
    prisma.certAssignment.findMany({
      where: { userId: me.id },
      include: { certificateType: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userCertificate.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
    }),
  ])

  // Latest cert per type
  const latestByType = new Map<string, (typeof certs)[number]>()
  for (const c of certs) {
    if (!latestByType.has(c.certificateTypeId)) latestByType.set(c.certificateTypeId, c)
  }

  const displayName =
    (me.firstName || me.lastName) ? `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim() : me.email

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Certificates</h1>
        <p className="text-sm text-muted-foreground">{displayName}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No required certificates assigned yet.</p>
          ) : (
            assignments.map((a) => {
              const latest = latestByType.get(a.certificateTypeId)
              const status = (latest?.status as any) ?? "MISSING"
              const expires = latest?.expiresAt ? new Date(latest.expiresAt).toLocaleDateString() : null

              return (
                <div key={a.id} className="flex items-center justify-between rounded-md border p-4">
                  <div className="space-y-1">
                    <div className="font-medium">{a.certificateType.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {expires ? `Expires: ${expires}` : "No upload on file"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={status} />
                    <UploadCertDialog
                      userId={me.id}
                      certificateTypeId={a.certificateTypeId}
                      certName={a.certificateType.name}
                      status={status}
                    />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}