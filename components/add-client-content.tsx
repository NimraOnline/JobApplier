"use client"

import { useActionState, useEffect, useState } from "react"
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
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { createClientAction } from "@/app/actions/client-signup"

interface Tier {
  id: number
  name: string
  monthly_price: number
}

interface AddClientContentProps {
  tiers: Tier[]
  userId: string
  isAdmin: boolean
}

export function AddClientContent({ tiers, userId, isAdmin }: AddClientContentProps) {
  const [state, formAction, isPending] = useActionState(createClientAction, null)
  const [showPassword, setShowPassword] = useState(false)
  
  // We need state for Role to conditionally show the Tier box
  const [selectedRole, setSelectedRole] = useState("client")
  // We keep Tier state to handle the default value reset
  const [selectedTier, setSelectedTier] = useState(tiers?.[0]?.id?.toString() || "")

  useEffect(() => {
    if (state?.success) {
      // 1. Reset native inputs
      const form = document.getElementById("add-user-form") as HTMLFormElement
      form?.reset()
      
      // 2. Reset custom state
      setSelectedRole("client")
      setSelectedTier(tiers?.[0]?.id?.toString() || "")
    }
  }, [state, tiers])

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow dark:bg-zinc-900 border dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-6">Create New User</h2>

      {state?.success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          {/* Ensure message exists or fallback */}
          {state.message || "User created successfully!"}
        </div>
      )}

      {state?.error && !state.success && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          {state.error}
        </div>
      )}

      <form id="add-user-form" action={formAction} className="space-y-4">
        <input type="hidden" name="createdBy" value={userId} />
        
        {/* REMOVED MANUAL HIDDEN INPUTS HERE - We use 'name' on Select instead */}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" required disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            {/* Added 'name="role"' here. Shadcn handles the hidden input automatically */}
            <Select 
              name="role" 
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={isPending}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                {isAdmin && <SelectItem value="manager">Manager</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" placeholder="user@example.com" required disabled={isPending} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Initial Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              disabled={isPending}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-500">Must be at least 6 characters.</p>
        </div>

        {/* Conditional Tier Selection */}
        {selectedRole === 'client' && (
          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="tierId">Subscription Tier</Label>
            {(!tiers || tiers.length === 0) ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                No tiers configured. Please contact an administrator.
              </p>
            ) : (
              // Added 'name="tierId"' here. 
              // Since this entire block is removed from DOM when role != client,
              // no tierId is sent for employees. Perfect behavior.
              <Select 
                name="tierId"
                value={selectedTier}
                onValueChange={setSelectedTier}
                disabled={isPending}
              >
                <SelectTrigger id="tierId">
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
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating..." : "Create User"}
        </Button>
      </form>
    </div>
  )
}
