import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="p-8 max-w-4x1 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            Certification Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Track Certifications, Expirations, and Compliance.
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary">
              Active
            </Badge>
            <Badge variant="destructive">
              Expired
            </Badge>
            <Button>Update Certification</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}