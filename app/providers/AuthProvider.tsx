// File: app/providers/AuthProvider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { signOutAction } from "@/app/actions/auth" 

// 1. Define the Context Shape
interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  isEmployee: boolean
  isManager: boolean
  signOut: () => Promise<void>
}

// 2. Create Context with defaults
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isEmployee: false,
  isManager: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize Supabase Client once
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Suppress AbortError from Supabase auth internals in preview
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason?.name === "AbortError" ||
        (event.reason instanceof Error && event.reason.message?.includes("signal is aborted")) ||
        (event.reason instanceof TypeError && event.reason.message === "Failed to fetch")
      ) {
        event.preventDefault()
      }
    }
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    const fetchProfile = async (userId: string) => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (mounted && data) {
          setProfile(data)
        }
      } catch {
        // Profile fetch failed, continue
      }
    }

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (!mounted) return

        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch {
        // Network or abort errors - fail silently
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    let subscription: { unsubscribe: () => void } | undefined

    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          try {
            if (!mounted) return
            setSession(newSession)
            setUser(newSession?.user ?? null)

            if (newSession?.user) {
              await fetchProfile(newSession.user.id)
            } else {
              setProfile(null)
            }

            setLoading(false)
            router.refresh()
          } catch {
            // Swallow errors inside the callback
          }
        }
      )
      subscription = data.subscription
    } catch {
      // Listener setup failed
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [supabase, router])

  // 4. The Server-Side Sign Out
  const signOut = async () => {
    try {
      setLoading(true) 
      await signOutAction() // Calls the Server Action
    } catch (error) {
      console.error("Sign out failed", error)
      setLoading(false)
    }
  }

  // 5. Helper Booleans
  const isEmployee = 
    profile?.role === 'employee' || 
    profile?.role === 'manager' || 
    profile?.role === 'admin'

  const isManager = 
    profile?.role === 'manager' || 
    profile?.role === 'admin'

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        profile, 
        loading, 
        isEmployee, 
        isManager, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
