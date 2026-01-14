"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import type { Client } from "@/types/client"

export function useClients() {
  const { supabase, user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  // Track mount state to avoid setting state on unmounted components
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    async function fetchAssignedClients() {
      if (!user?.id) return

      try {
        // Only set hard loading if we don't have clients yet
        // This prevents the UI from flashing if we background refresh
        setLoading((prev) => prev && clients.length === 0) 
        
        const { data, error } = await supabase
          .from("clients")
          .select("*, client_assignments!inner(employee_id, is_active)") 
          .eq("client_assignments.employee_id", user.id)
          .eq("client_assignments.is_active", true)
          .order("name")

        if (error) throw error
        
        if (isMounted.current) {
          setClients(data as unknown as Client[])
        }
      } catch (err) {
        console.error("Error fetching assigned clients:", err)
      } finally {
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchAssignedClients()

    // FIX: Only re-run if the User ID changes, not the entire user object
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user?.id]) 

  return { clients, loading }
}
