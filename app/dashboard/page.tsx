// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClientWrapper } from "./client-wrapper"

export default async function DashboardPage() {
    console.log('🔍 DashboardPage env check:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ present' : '❌ missing',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ present' : '❌ missing',
  });
  try {
    console.log('🚀 DashboardPage server component started')
    
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('❌ No user, redirecting to login')
      return redirect('/login')
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile fetch error:', profileError)
      return redirect('/login?message=Profile not found')
    }

    const isEmployee = ['employee', 'manager', 'admin'].includes(profile.role)
    const isManager = ['manager', 'admin'].includes(profile.role)

    if (!isEmployee) {
      console.log('❌ Not an employee, redirecting')
      return redirect('/login?message=Access denied')
    }

    console.log('✅ User authenticated, profile:', profile)

    // Fetch my clients
    const { data: myClients } = await supabase
      .from("clients")
      .select("*, client_assignments!inner(employee_id, is_active)") 
      .eq("client_assignments.employee_id", user.id)
      .eq("client_assignments.is_active", true)

    // Manager data
    let managerData = { employees: [], allClients: [], tiers: [] }

    if (isManager) {
      const [empResult, cliResult, tiersResult] = await Promise.allSettled([
        supabase.from('user_profiles').select('id, full_name, role').in('role', ['employee', 'manager']).eq('is_active', true),
        supabase.from('clients').select('id, name, email, status').order('name'),
        supabase.from('client_tiers').select('id, name, monthly_price').order('monthly_price')
      ])

      managerData = {
        employees: empResult.status === 'fulfilled' ? empResult.value.data || [] : [],
        allClients: cliResult.status === 'fulfilled' ? cliResult.value.data || [] : [],
        tiers: tiersResult.status === 'fulfilled' ? tiersResult.value.data || [] : []
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
  } catch (error) {
    console.error('💥 DashboardPage crashed:', error)
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1 style={{ color: 'red' }}>Dashboard failed to load</h1>
        <p>This is a server error. Check the logs below:</p>
        <pre style={{ background: '#f1f1f1', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
          {error instanceof Error && error.stack && `\n\n${error.stack}`}
        </pre>
      </div>
    )
  }
}
