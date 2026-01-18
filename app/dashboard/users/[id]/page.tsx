import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AssignCertButton } from "./AssignCertButton"

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      certAssignments: { include: { certificateType: true } },
    },
  })

  if (!user) return <div className="p-8">User not found</div>

  const allCertTypes = await prisma.certificateType.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: "asc" },
  })

  const assignedIds = new Set(user.certAssignments.map(a => a.certificateTypeId))

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">{user.email}</h1>

      <Card>
  <CardHeader>
    <CardTitle>Required Certificates</CardTitle>
  </CardHeader>
  <CardContent className="space-y-2 text-sm">
    {user.certAssignments.length === 0 && (
      <div className="text-muted-foreground">None assigned yet.</div>
    )}

    {user.certAssignments.map((a) => (
      <div
        key={a.id}
        className="flex items-center justify-between border-b py-2"
      >
        <div>
          <div className="font-medium">{a.certificateType.name}</div>
          <div className="text-xs text-muted-foreground">
            Status: Not uploaded
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Upload next</span>
      </div>
    ))}
  </CardContent>
</Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Certificate Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {allCertTypes.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between border-b py-2">
              <span>{ct.name}</span>
              <AssignCertButton
  userId={user.id}
  certificateTypeId={ct.id}
  assigned={assignedIds.has(ct.id)}
/>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}