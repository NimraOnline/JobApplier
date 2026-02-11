// File: app/providers/AuthProvider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { signOutAction } from "@/app/actions/auth" // <--- Import the server action

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

    // Function to fetch full profile data
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
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    // Main initialization logic
    const initializeAuth = async () => {
      try {
        // 1. Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
        }

        // 2. If we have a user, fetch their profile
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch (error) {
        console.error("Auth initialization failed:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // 3. Listen for changes (Sign in, Token Refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (mounted) {
          setSession(newSession)
          setUser(newSession?.user ?? null)
          
          if (newSession?.user) {
            // Only fetch profile if we don't have it or user changed
            await fetchProfile(newSession.user.id)
          } else {
            setProfile(null)
          }
          
          setLoading(false)
          router.refresh() // Refresh Server Components when auth changes
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
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
