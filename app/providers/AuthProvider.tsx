"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: any | null
  loading: boolean
  isEmployee: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isEmployee: false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // 1. Define the fetch logic
    const getSession = async () => {
      try {
        // A. Get the session (checks local storage & cookies)
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error || !currentSession) {
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false) // <--- CRITICAL: Stop loading even if no session
          }
          return
        }

        // B. If session exists, fetch profile
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession.user)
        }

        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()

        if (mounted) {
          setProfile(userProfile)
          setLoading(false)
        }

      } catch (err) {
        console.error("Auth initialization error:", err)
        if (mounted) setLoading(false) // <--- CRITICAL: Always stop loading
      }
    }

    // 2. Run immediately
    getSession()

    // 3. Listen for changes (Sign In, Sign Out, Auto-Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        
        if (!newSession) {
            setProfile(null)
            setLoading(false) // ensure loading stops on sign out
        } else {
             // Optional: Refetch profile on session change if needed
             // For now, we assume the previous fetch covered it or page reload will handle it
             setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isEmployee = profile?.role === 'employee' || profile?.role === 'manager' || profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, isEmployee, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
