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
    // This data is used for both "Add Client" and the new "Assignments" tab
    let managerData = { employees: [], allClients: [], tiers: [] }

    if (isManager) {
      const [empResult, cliResult, tiersResult] = await Promise.allSettled([
        // List of staff members to assign clients TO
        supabase.from('user_profiles')
          .select('id, full_name, role')
          .in('role', ['employee', 'manager'])
          .eq('is_active', true)
          .order('full_name'),
        
        // List of all clients in the system to assign FROM
        supabase.from('clients')
          .select('id, name, email, status')
          .order('name'),
        
        // List of tiers for the Add Client form
        supabase.from('client_tiers')
          .select('id, name, monthly_price')
          .order('monthly_price')
      ])

      managerData = {
        employees: empResult.status === 'fulfilled' ? empResult.value.data || [] : [],
        allClients: cliResult.status === 'fulfilled' ? cliResult.value.data || [] : [],
        tiers: tiersResult.status === 'fulfilled' ? tiersResult.value.data || [] : []
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
