"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User, SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

type AuthContextType = {
  supabase: SupabaseClient<Database> // <--- We now share the client
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize Supabase client ONCE
  const [supabase] = useState(() => createClient())
  
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
        setProfile(data)
    }

    const getInitialAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
            await fetchProfile(currentSession.user.id)
        } else {
            setProfile(null)
        }
      } catch (error) {
        console.error("Auth init error:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
            setSession(newSession)
            setUser(newSession?.user ?? null)
            
            if (newSession?.user) {
                await fetchProfile(newSession.user.id)
            } else {
                setProfile(null)
            }
            setLoading(false)
        }
      }
    )

    return () => {
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
