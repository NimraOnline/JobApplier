"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import type { Client } from "@/types/client"

export function useClients() {
  const { supabase, user } = useAuth() // Get the current logged-in employee
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssignedClients() {
      // Don't fetch if user isn't loaded yet
      if (!user) return

      try {
        setLoading(true)
        
        // QUERY EXPLANATION:
        // 1. Select all client columns
        // 2. Perform an INNER JOIN on client_assignments (!inner)
        // 3. Filter where the assignment's employee_id matches the current user
        // 4. Filter where the assignment is active
        
        const { data, error } = await supabase
          .from("clients")
          .select("*, client_assignments!inner(employee_id, is_active)") 
          .eq("client_assignments.employee_id", user.id)
          .eq("client_assignments.is_active", true)
          .order("name")

        if (error) throw error
        
        // The data structure is flattened by Supabase, but we just need the client fields
        setClients(data as unknown as Client[])
      } catch (err) {
        console.error("Error fetching assigned clients:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedClients()
  }, [supabase, user])

  return { clients, loading }
}
