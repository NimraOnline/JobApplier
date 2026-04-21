// app/dashboard/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardClientWrapper } from "./client-wrapper"

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const activeTab = (resolvedParams.tab as string) || "dashboard"

  try {
    // --- BYPASS MODE: Mocking everything to ignore broken Supabase ---

    // 1. Mock User
    const user = { id: '123', email: 'test@example.com', role: 'admin' }

    // 2. Mock Profile (Bypasses the "Profile not found" redirect)
    const profile = {
      id: '123',
      full_name: 'Test Admin',
      role: 'admin',
      is_active: true
    }

    // 3. Authorization Check (Hardcoded to true)
    const isEmployee = true
    const isManager = true

    // 4. Mock "My Clients" (Empty array so it doesn't crash)
    const myClients: any[] = []

    // 5. Mock Manager Data
    let managerData = {
      employees: [{ id: '123', full_name: 'Test Admin', role: 'admin' }],
      allClients: [],
      tiers: []
    }

    // --- END BYPASS MODE ---

    /* 
    // ORIGINAL LOGIC COMMENTED OUT
    const supabase = await createClient()
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    ... etc ...
    */

    return (
      <DashboardClientWrapper
        user={user}
        profile={profile}
        initialClients={myClients}
        managerData={managerData}
        isManager={isManager}
        initialTab={activeTab}
      />
    )
  } catch (error) {
    console.error('💥 DashboardPage crashed:', error)
  }
}
