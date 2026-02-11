import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"

// Components
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { DashboardClientWrapper } from "./client-wrapper" // New wrapper we will make below

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // Check Role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isEmployee = profile && ['employee', 'manager', 'admin'].includes(profile.role)
  if (!isEmployee) return redirect('/login?message=Access denied')

  const isManager = profile?.role === 'manager' || profile?.role === 'admin'

  // Fetch standard data (My Clients)
  const { data: myClients } = await supabase
    .from("clients")
    .select("*, client_assignments!inner(employee_id, is_active)") 
    .eq("client_assignments.employee_id", user.id)
    .eq("client_assignments.is_active", true)

  // Fetch Manager Data (IF MANAGER)
  let managerData = null
  if (isManager) {
    managerData = await getManagerData()
  }

  return (
    <DashboardClientWrapper 
      user={user} 
      profile={profile} 
      initialClients={myClients || []}
      managerData={managerData} // <--- Pass this down
    />
  )
}
