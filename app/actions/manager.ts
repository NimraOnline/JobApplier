"use server"

import { createClient } from "@/lib/supabase/server"

export async function getManagerData() {
  const supabase = await createClient()
  
  // 1. Security Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'manager' && profile?.role !== 'admin') {
    return { error: "Access Denied: Managers only" }
  }

  // 2. Fetch All Employees
  const { data: employees } = await supabase
    .from('user_profiles')
    .select('id, full_name, role')
    .in('role', ['employee', 'manager']) -- Managers can assign to other managers too
    .eq('is_active', true)
    .order('full_name')

  // 3. Fetch Unassigned or All Clients
  // (Adjust logic depending if you want to see re-assignments)
  const { data: clients } = await supabase
    .from('clients')
    .select(`
      id, name, email, status,
      client_assignments(employee_id, is_active)
    `)
    .order('created_at', { ascending: false })

  return { employees, clients }
}
