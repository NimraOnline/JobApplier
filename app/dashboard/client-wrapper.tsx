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

export function DashboardClientWrapper({ 
  user: propUser, 
  profile: propProfile, 
  initialClients, 
  managerData, 
  isManager: propIsManager 
}: any) {
  // Get auth context as fallback
  const { profile: authProfile, user: authUser } = useAuth()
  
  // Use props if provided, otherwise fall back to auth values
  const profile = propProfile || authProfile
  const user = propUser || authUser
  
  // Compute isManager – either from prop or from profile role
  const isManager = propIsManager ?? (profile?.role === 'manager' || profile?.role === 'admin')
  
  const { activeTab, handleTabChange } = useTabsSimple()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      {/* Pass profile to TopNav so it can show manager tab even if AuthProvider is slow */}
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)}
        profile={profile} // <-- Pass profile down
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

        {/* Add Client tab – only visible to managers */}
        {activeTab === 'add-client' && isManager && (
          <AddClientContent 
            tiers={managerData?.tiers || []} 
            userId={user?.id} // Add optional chaining in case user is null
          />
        )}
      </main>
    </div>
  )
}
