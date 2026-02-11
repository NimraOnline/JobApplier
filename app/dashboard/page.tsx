import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server"

// Components
import { TopNav } from "@/components/top-nav"
import { DashboardClientWrapper } from "./client-wrapper"

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Profile & Role
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError)
    return redirect('/login?message=Profile not found')
  }

  const isEmployee = ['employee', 'manager', 'admin'].includes(profile.role)
  const isManager = ['manager', 'admin'].includes(profile.role)

  if (!isEmployee) return redirect('/login?message=Access denied')

  // 3. Fetch My Clients (For the standard dashboard tab)
  const { data: myClients } = await supabase
    .from("clients")
    .select("*, client_assignments!inner(employee_id, is_active)") 
    .eq("client_assignments.employee_id", user.id)
    .eq("client_assignments.is_active", true)

  // 4. Fetch Manager Data (Wrapped in Try/Catch to prevent crashes)
  let managerData = { employees: [], allClients: [] }

  if (isManager) {
    try {
      // Fetch all employees for the assignment dropdown
      const { data: empData } = await supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .in('role', ['employee', 'manager'])
        .eq('is_active', true)

      // Fetch all clients (to see who needs assigning)
      // Note: We use a simpler select here to avoid join errors
      const { data: cliData } = await supabase
        .from('clients')
        .select('id, name, email, status')
        .order('name')

      managerData = {
        employees: empData || [],
        allClients: cliData || []
      }
    } catch (err) {
      console.error("Manager data fetch failed:", err)
      // We don't crash the page, we just pass empty manager data
    }
  }

  return (
    <DashboardClientWrapper 
      user={user} 
      profile={profile} 
      initialClients={myClients || []}
      managerData={managerData}
      isManager={isManager}
    />
  )
}
