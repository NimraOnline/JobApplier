"use client"

import { useEffect, useState, useRef } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import type { Client } from "@/types/client"

export function useClients() {
  const { supabase, user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    let mounted = true

    async function fetchAssignedClients() {
      // Safety: If no user, stop loading and return empty
      if (!user?.id) {
        if (mounted) setLoading(false)
        return
      }

      try {
        // Only set loading true if we don't have data yet (prevents flicker on re-fetch)
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
      } catch (err) {
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
  }, [user?.id]) // Only re-run when User ID changes

  return { clients, loading }
}
