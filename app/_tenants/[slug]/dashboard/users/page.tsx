import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function UsersPage() {
  const org = await prisma.organization.findFirst()
  if (!org) return <div className="p-8">No organization found. Seed first.</div>

  const users = await prisma.user.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, firstName: true, lastName: true, role: true },
  })

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Users</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {users.map((u) => (
            <a
              key={u.id}
              href={`/dashboard/users/${u.id}`}
              className="block rounded-md border p-3 text-sm hover:bg-muted"
            >
              <div className="font-medium">
                {(u.firstName || u.lastName) ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : u.email}
              </div>
              <div className="text-muted-foreground">{u.email} • {u.role}</div>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}