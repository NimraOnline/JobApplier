"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { loginAction } from "@/app/actions/login"
import { Suspense } from "react"

function LoginForm() {
  const searchParams = useSearchParams()
  const middlewareMessage = searchParams.get("message")

  // Bind the Server Action
  const [state, formAction, isPending] = useActionState(loginAction, null)

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-zinc-900 border dark:border-zinc-800">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Employee Portal</h1>
        <p className="text-gray-500 dark:text-gray-400">Enter your credentials to access the workspace</p>
      </div>

      {/* Middleware Messages */}
      {middlewareMessage && (
        <div className="flex items-center gap-2 p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{middlewareMessage}</span>
        </div>
      )}

      {/* Login Action Errors */}
      {state?.error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="employee@company.com"
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            disabled={isPending}
          />
        </div>
        
        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
