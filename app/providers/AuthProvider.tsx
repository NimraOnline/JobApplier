"use client"

import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { User, Session } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

// ... (Keep your Interface and Context definitions the same) ...
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
  
  // FIX: Use useMemo to ensure 'supabase' object reference NEVER changes
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error || !currentSession) {
          if (mounted) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(currentSession)
          setUser(currentSession.user)
        }

        // Fetch profile
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
        console.error("Auth init error:", err)
        if (mounted) setLoading(false)
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        if (!newSession) {
             setProfile(null) 
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    // FIX: Dependency array is now safe because 'supabase' is memoized
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
