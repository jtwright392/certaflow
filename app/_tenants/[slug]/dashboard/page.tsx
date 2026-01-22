import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const org = await prisma.organization.findFirst()
  if (!org) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">CertaFlow</h1>
        <p className="text-muted-foreground mt-2">No organization found. Run seed first.</p>
      </div>
    )
  }

  const [users, certTypes, assignments, uploads] = await Promise.all([
    prisma.user.count({ where: { organizationId: org.id } }),
    prisma.certificateType.count({ where: { organizationId: org.id } }),
    prisma.certAssignment.count({ where: { organizationId: org.id } }),
    prisma.userCertificate.count({ where: { organizationId: org.id } }),
  ])

  const recentCertTypes = await prisma.certificateType.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, createdAt: true },
  })

 const recentUsers = await prisma.user.findMany({
  where: { organizationId: org.id },
  orderBy: { createdAt: "desc" },
  take: 5,
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    role: true,
  },
})
  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Org: {org.name}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link href="/dashboard/users">Manage Users</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/cert-types">Certificate Types</Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{users}</div>
            <p className="text-xs text-muted-foreground">People in your org</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificate Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{certTypes}</div>
            <p className="text-xs text-muted-foreground">CPR, Forklift, etc.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{assignments}</div>
            <p className="text-xs text-muted-foreground">Required cert links</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{uploads}</div>
            <p className="text-xs text-muted-foreground">User certificates stored</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentUsers.length === 0 ? (
              <p className="text-muted-foreground">No users yet.</p>
            ) : (
              recentUsers.map((u: {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
}) => (
                <Link
                  key={u.id}
                  href={`/dashboard/users/${u.id}`}
                  className="block rounded-md border p-3 hover:bg-muted"
                >
                  <div className="font-medium">
                    {(u.firstName || u.lastName)
                      ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                      : u.email}
                  </div>
                  <div className="text-muted-foreground">{u.email} • {u.role}</div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Certificate Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recentCertTypes.length === 0 ? (
              <p className="text-muted-foreground">No certificate types yet.</p>
            ) : (
              recentCertTypes.map((ct: { id: string; name: string; createdAt: Date }) => (
                <div key={ct.id} className="rounded-md border p-3">
                  <div className="font-medium">{ct.name}</div>
                  <div className="text-muted-foreground">
                    Added {ct.createdAt.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}