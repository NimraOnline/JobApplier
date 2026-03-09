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
// ✅ IMPORT PLAYBOOK FROM COMPONENTS
import { PlaybookContent } from "@/components/PlaybookContent" 

export function DashboardClientWrapper({ 
  user: propUser, 
  profile: propProfile, 
  initialClients, 
  managerData, 
  isManager: propIsManager,
  initialTab 
}: any) {
  const { profile: authProfile, user: authUser } = useAuth()
  const profile = propProfile || authProfile
  const user = propUser || authUser
  const isManager = propIsManager ?? (profile?.role === 'manager' || profile?.role === 'admin')
  
  const { activeTab, handleTabChange } = useTabsSimple(initialTab)
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)}
        profile={profile} 
      />
      
      <main className="p-6">
        {activeTab === 'dashboard' && <DashboardContent clients={initialClients} isLoading={false} />}
        {activeTab === 'clients' && <ClientsContent clients={initialClients} isLoading={false} />}
        {activeTab === 'generate-edit' && <GenerateEditContent />}
        {activeTab === 'settings' && <SettingsContent />}
        
        {/* ✅ ADD PLAYBOOK TAB HERE (Visible to everyone) */}
        {activeTab === 'playbook' && <PlaybookContent />}

        {/* Manager Only Tabs */}
        {activeTab === 'add-client' && isManager && (
          <AddClientContent tiers={managerData?.tiers || []} userId={user?.id} isAdmin={profile?.role === 'admin'} />
        )}
        {activeTab === "assignments" && isManager && (
          <AssignmentsContent clients={managerData?.allClients || []} employees={managerData?.employees || []} />
        )}
      </main>
    </div>
  )
}
