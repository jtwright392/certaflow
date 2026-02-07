import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PrismaClient } from "@prisma/client/extension"
import { CreateCertTypeDialog } from "./CreateCertTypeDialog"
import { DeleteCertTypeButton } from "./DeleteCertTypeButton"

export default async function CertTypesPage() {
  const certTypes = await prisma.certificateType.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Certificate Types</h1>

        <CreateCertTypeDialog/>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {certTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">No certificates yet.</p>
          )}

          {certTypes.map((cert) => (
  <div key={cert.id} className="flex items-center justify-between border-b py-2 text-sm">
    <div className="space-y-1">
      <div className="font-medium">{cert.name}</div>
      <div className="text-muted-foreground">
        {cert.renewalCadenceDays ? `Renews every ${cert.renewalCadenceDays} days` : "Manual renewal"}
      </div>
    </div>

    <DeleteCertTypeButton id={cert.id} name={cert.name} />
  </div>
))}
        </CardContent>
      </Card>
    </div>
  )
}