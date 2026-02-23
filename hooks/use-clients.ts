"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import { createClient } from "@/lib/supabase/client" // <--- IMPORT THIS
import type { Client } from "@/types/client" // Ensure you have this type defined or remove if not needed

export function useClients() {
  const { user } = useAuth() // <--- REMOVE 'supabase' from here
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  
  // Initialize the client here
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    async function fetchAssignedClients() {
      // 1. If no user yet, just wait (don't stop loading yet if auth is initializing)
      if (!user?.id) {
        return
      }

      try {
        setLoading(true)
        
        // 2. Fetch clients assigned to this employee
        // We use !inner to ensure we only get clients that HAVE an assignment
        const { data, error } = await supabase
          .from("clients")
          .select(`
            *,
            client_assignments!inner(employee_id, is_active)
          `) 
          .eq("client_assignments.employee_id", user.id)
          .eq("client_assignments.is_active", true)
          .order("name")

        if (error) throw error
        
        if (mounted && data) {
          setClients(data as unknown as Client[])
        }
      } catch (err: any) {
        // 3. Ignore technical abort errors (happens during rapid navigation)
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
  }, [user?.id]) // supabase client is stable, so we just watch user.id

  return { clients, loading }
}
