"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CreateCertTypeDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [renewalDays, setRenewalDays] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch("/api/cert-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        renewalCadenceDays: renewalDays ? Number(renewalDays) : null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data?.error ?? "Failed to create certificate type")
      return
    }

    setName("")
    setRenewalDays("")
    setOpen(false)
    // simple refresh
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Certificate</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create certificate type</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="CPR Certification"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewal">Renewal cadence (days)</Label>
            <Input
              id="renewal"
              value={renewalDays}
              onChange={(e) => setRenewalDays(e.target.value)}
              placeholder="365"
              inputMode="numeric"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if expiration is manually set per upload.
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}