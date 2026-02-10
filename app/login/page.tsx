"use client"

import { useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react" // Import Alert Icon
function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const urlMessage = searchParams.get("message")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null) // Clear previous errors

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Show the error on screen
        setErrorMsg(error.message) 
        setIsSubmitting(false)
        return
      }

      // If successful, refresh and go
      router.refresh() 
      router.push("/dashboard")
      
    } catch (err) {
      setErrorMsg("An unexpected network error occurred.")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Employee Login</h1>
        <p className="text-gray-500">Enter your credentials to access the portal</p>
      </div>

      {/* URL Messages (Middleware Redirects) */}
      {urlMessage && (
        <div className="p-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
          {urlMessage}
        </div>
      )}

      {/* Login Errors (Explicit Red Box) */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
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
