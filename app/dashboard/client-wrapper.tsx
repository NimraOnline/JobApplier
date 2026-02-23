"use client"

import { useAuth } from "@/app/providers/AuthProvider"
import { useTabsSimple } from "@/hooks/use-tabs-simple"
import { TabId } from "@/lib/tabs"
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { GenerateEditContent } from "@/components/generate-edit-content"
import { SettingsContent } from "@/components/settings-content"
import { AddClientContent } from "@/components/add-client-content"
import { AssignmentsContent } from "@/components/dashboard/AssignmentsContent"

export function DashboardClientWrapper({ 
  user: propUser, 
  profile: propProfile, 
  initialClients, 
  managerData, 
  isManager: propIsManager ,
  initialTab // ✅ Receive from props
}: any) {
  // 1. Get auth context (initialized instantly via props in layout.tsx)
  const { profile: authProfile, user: authUser } = useAuth()
  
  // 2. Use the most up-to-date profile available
  const profile = propProfile || authProfile
  const user = propUser || authUser
  
  // 3. Compute permissions
  const isManager = propIsManager ?? (profile?.role === 'manager' || profile?.role === 'admin')
  
  const { activeTab, handleTabChange } = useTabsSimple(initialTab) 
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)}
        // Ensure TopNav receives the profile for instant "Alice" name rendering
        profile={profile} 
      />
      
      <main className="p-6">
        {activeTab === 'dashboard' && (
          <DashboardContent clients={initialClients} isLoading={false} />
        )}
        
        {activeTab === 'clients' && (
          <ClientsContent clients={initialClients} isLoading={false} />
        )}
        
        {activeTab === 'generate-edit' && <GenerateEditContent />}
        
        {activeTab === 'settings' && <SettingsContent />}

        {/* --- MANAGER ONLY TABS --- */}
        
        {/* Add Client Tab */}
        {activeTab === 'add-client' && isManager && (
          <AddClientContent 
            tiers={managerData?.tiers || []} 
            userId={user?.id}
            isAdmin={profile?.role === 'admin'}
          />
        )}

        {/* Assignments Tab - Added the 'isManager' guard here ✅ */}
        {activeTab === "assignments" && isManager && (
          <AssignmentsContent 
            clients={managerData?.allClients || []} 
            employees={managerData?.employees || []} 
          />
        )}
      </main>
    </div>
  )
}
