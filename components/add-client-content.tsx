"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { createClientAction } from "@/app/actions/client-signup"

interface Tier {
  id: number
  name: string
  monthly_price: number
}

interface AddClientContentProps {
  tiers: Tier[]
  userId: string // optional, could be used for audit/assignment
}

export function AddClientContent({ tiers, userId }: AddClientContentProps) {
  const [state, formAction, isPending] = useActionState(createClientAction, null)

  // Optional: Reset form on success
  useEffect(() => {
    if (state?.success) {
      // Reset the form – we can do this by resetting the form element
      const form = document.getElementById("add-client-form") as HTMLFormElement
      form?.reset()
    }
  }, [state])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Add New Client</h2>

      {/* Success message */}
      {state?.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          Client created successfully!
        </div>
      )}

      {/* Error message */}
      {state?.error && !state.success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          {state.error}
        </div>
      )}

      <form id="add-client-form" action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company / Client Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Acme Inc."
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Contact Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="contact@acme.com"
            required
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tierId">Subscription Tier</Label>
          <Select name="tierId" required disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select a tier" />
            </SelectTrigger>
            <SelectContent>
              {tiers.map((tier) => (
                <SelectItem key={tier.id} value={String(tier.id)}>
                  {tier.name} (${tier.monthly_price}/mo)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Client"}
        </Button>
      </form>
    </div>
  )
}
