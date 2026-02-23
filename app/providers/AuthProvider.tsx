// app/providers/AuthProvider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { signOutAction } from "@/app/actions/auth"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  isEmployee: boolean
  isManager: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: false,
  isEmployee: false,
  isManager: false,
  signOut: async () => {},
})

export function AuthProvider({ 
  children, 
  initialUser = null, 
  initialProfile = null 
}: { 
  children: React.ReactNode
  initialUser?: User | null
  initialProfile?: any | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [session, setSession] = useState<Session | null>(null) // we may not need session
  const [profile, setProfile] = useState<any | null>(initialProfile)
  const [loading, setLoading] = useState(false) // no loading on initial render
  const [supabase] = useState(() => createClient())
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Sync with Supabase auth state (optional, but good for token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return
        if (newSession) {
          setUser(newSession.user)
          // Optionally refresh profile if needed
          const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single()
          if (data) setProfile(data)
        } else {
          setUser(null)
          setProfile(null)
        }
        router.refresh()
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    setLoading(true)
    await signOutAction()
    // The redirect will happen; loading will be reset after redirect
  }

  const isEmployee = ['employee', 'manager', 'admin'].includes(profile?.role)
  const isManager = ['manager', 'admin'].includes(profile?.role)

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isEmployee, isManager, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
