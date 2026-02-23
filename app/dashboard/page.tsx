// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClientWrapper } from "./client-wrapper"

// ✅ Force dynamic rendering to prevent build errors with cookies
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  // Extract searchParams if you want to use them on the server, 
  // though the ClientWrapper usually handles the tab state.
  const resolvedParams = await searchParams
  const activeTab = (resolvedParams.tab as string) || "dashboard"

  try {
    const supabase = await createClient()

    // 1. Authenticate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return redirect('/login')
    }

    // 2. Fetch User Profile & Role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile fetch error:', profileError)
      return redirect('/login?message=Profile not found')
    }

    // 3. Authorization Check
    const isEmployee = ['employee', 'manager', 'admin'].includes(profile.role)
    const isManager = ['manager', 'admin'].includes(profile.role)

    if (!isEmployee) {
      return redirect('/login?message=Access denied')
    }

    // 4. Fetch "My Clients" (The ones currently assigned to the logged-in user)
    const { data: myClients } = await supabase
      .from("clients")
      .select("*, client_assignments!inner(employee_id, is_active)") 
      .eq("client_assignments.employee_id", user.id)
      .eq("client_assignments.is_active", true)

    // 5. Fetch Manager-Specific Data
    // Manager data initialization
    let managerData = { employees: [], allClients: [], tiers: [] }

    if (isManager) {
      console.log('📡 DEBUG: Fetching as Manager...')

      // 1. Fetch Staff (Verification)
      const { data: staff, error: staffErr } = await supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .in('role', ['employee', 'manager', 'admin'])
        .eq('is_active', true)

      if (staffErr) console.error('❌ Staff Query Error:', staffErr)

      // 2. Fetch Clients (Simplified - NO JOIN first)
      // If this returns clients, then our Join syntax was the problem.
      // If this returns 0, then RLS (Database Permissions) is the problem.
      // 2. Fetch Clients WITH their active assignments and employee names
      const { data: rawClients, error: cliErr } = await supabase
        .from('clients')
        .select(`
          *,
          client_assignments (
            is_active,
            user_profiles!client_assignments_employee_id_fkey (
              full_name
            )
          )
        `)
        .order('name')

      if (cliErr) {
        console.error('❌ Raw Clients Query Error:', cliErr)
      } else {
        console.log(`✅ Raw Clients count: ${rawClients?.length || 0}`)
      }

      // 3. Fetch Tiers
      const { data: tiers } = await supabase.from('client_tiers').select('*')

      managerData = {
        employees: staff || [],
        allClients: rawClients || [], // We will add the assignment info back once we see data
        tiers: tiers || []
      }
    }

    // 6. Pass everything to the Client Wrapper
    // The Wrapper will decide which component to show (Dashboard, Clients, or Assignments)
    return (
      <DashboardClientWrapper 
        user={user} 
        profile={profile} 
        initialClients={myClients || []}
        managerData={managerData}
        isManager={isManager}
        initialTab={activeTab} // ✅ ADD THIS LINE
      />
    )
  } catch (error) {
    console.error('💥 DashboardPage crashed:', error)
    return (
      <div className="p-8 font-sans">
        <h1 className="text-red-600 text-2xl font-bold">Dashboard failed to load</h1>
        <p className="mt-2 text-slate-600">This is a server error. Please try refreshing the page.</p>
        <pre className="mt-4 bg-slate-100 p-4 rounded text-xs overflow-auto max-w-full">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    )
  }
}
