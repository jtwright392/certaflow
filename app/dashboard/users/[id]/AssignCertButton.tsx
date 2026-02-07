"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AssignCertButton({
  userId,
  certificateTypeId,
  assigned,
}: {
  userId: string
  certificateTypeId: string
  assigned: boolean
}) {
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)

    const res = await fetch(`/api/users/${userId}/assignments`, {
      method: assigned ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateTypeId }),
    })

    setLoading(false)

    if (!res.ok) {
      alert("Failed to update assignment.")
      return
    }

    window.location.reload()
  }

  return (
    <Button
      size="sm"
      variant={assigned ? "secondary" : "default"}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? "Saving..." : assigned ? "Unassign" : "Assign"}
    </Button>
  )
}