"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import type { Client } from "@/types/client"

export function useClients() {
  const { supabase, user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let mounted = true

    async function fetchAssignedClients() {
      if (!user?.id) {
        if (mounted) setLoading(false)
        return
      }

      try {
        setLoading(prev => prev || clients.length === 0)
        
        const { data, error } = await supabase
          .from("clients")
          .select("*, client_assignments!inner(employee_id, is_active)") 
          .eq("client_assignments.employee_id", user.id)
          .eq("client_assignments.is_active", true)
          .order("name")

        if (error) throw error
        
        if (mounted) {
          setClients(data as unknown as Client[])
        }
      } catch (err: any) {
        // --- THE FIX: IGNORE ABORT ERRORS HERE TOO ---
        if (err.name === 'AbortError' || err.message?.includes('aborted') || err.message?.includes('fetch failed')) {
           return 
        }
        console.error("Error fetching assigned clients:", err)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchAssignedClients()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) 

  return { clients, loading }
}
