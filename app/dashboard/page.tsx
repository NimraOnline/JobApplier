import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"

// Components
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { DashboardClientWrapper } from "./client-wrapper" // New wrapper we will make below

export default async function DashboardPage() {
  // 1. Initialize Server Client
  const supabase = await createClient()

  // 2. Check Auth (Securely on Server)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // 3. Check Role (Securely on Server)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)

  if (!isEmployee) {
    return redirect('/login?message=Access denied')
  }

  // 4. Fetch Clients (The "Strategic" part)
  // We fetch data here so it's ready immediately
  const { data: clients } = await supabase
    .from("clients")
    .select(`
      *,
      client_assignments!inner(employee_id, is_active)
    `)
    .eq("client_assignments.employee_id", user.id)
    .eq("client_assignments.is_active", true)
    .order("name")

  // 5. Pass data to a Client Component Wrapper
  return (
    <DashboardClientWrapper 
      user={user} 
      profile={profile} 
      initialClients={clients || []} 
    />
  )
}
