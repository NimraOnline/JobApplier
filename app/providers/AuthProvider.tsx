"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

type AuthContextType = {
  supabase: SupabaseClient<Database>
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
        
        if (error && error.code !== 'PGRST116') throw error
        if (mounted && data) setProfile(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    const getInitialAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          if (currentSession?.user) {
              await fetchProfile(currentSession.user.id)
          } else {
              setProfile(null)
          }
        }
      } catch (error: any) {
        // --- THE FIX: IGNORE ABORT ERRORS ---
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
          return
        }
        console.error("Auth init error:", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getInitialAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
            setSession(newSession)
            setUser(newSession?.user ?? null)
            
            if (newSession?.user) {
                try {
                  await fetchProfile(newSession.user.id)
                } catch (err) {
                  console.error("Profile refresh error", err)
                }
            } else {
                setProfile(null)
            }
            setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const isEmployee = !!profile && ['employee', 'manager', 'admin'].includes(profile.role);

  return (
    <AuthContext.Provider value={{ supabase, session, user, profile, loading, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
