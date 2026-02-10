"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/app/providers/AuthProvider" // Import context

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  // Local loading state for the BUTTON only
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { user } = useAuth() // specific hook usage

  const message = searchParams.get("message")

  // Redirect logic: Only if user is ALREADY logged in
  if (user) {
    router.push("/dashboard")
    return <div className="text-center p-10">Redirecting to dashboard...</div>
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error("Login Failed", { description: error.message })
        setIsSubmitting(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error("An unexpected error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Employee Login</h1>
        <p className="text-gray-500">Enter your credentials to access the portal</p>
      </div>

      {message && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {message}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isSubmitting}
          />
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Suspense fallback={<div className="text-center">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
