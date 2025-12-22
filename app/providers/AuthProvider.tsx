"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

type AuthContextType = {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isEmployee: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  isEmployee: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // FIX: Use useState initializer to ensure createClient runs exactly once
  const [supabase] = useState(() => createClient()) 
  
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get Initial Session
    const getInitialAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        // Handle session state
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

    // Helper to fetch profile
    const fetchProfile = async (userId: string) => {
        const { data } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId)
            .single()
        setProfile(data)
    }

    getInitialAuth()

    // 2. Listen for Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Only react to specific events to avoid double-firing
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
    <AuthContext.Provider value={{ session, user, profile, loading, isEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
