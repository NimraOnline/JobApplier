"use client"

import { useTabsSimple } from "@/hooks/use-tabs-simple"
import { TabId } from "@/lib/tabs"
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { GenerateEditContent } from "@/components/generate-edit-content"
import { SettingsContent } from "@/components/settings-content"

export function DashboardClientWrapper({ user, profile, initialClients }: any) {
  const { activeTab, handleTabChange } = useTabsSimple()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)} 
        userFullName={profile?.full_name} 
        userRole={profile?.role}
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
        {activeTab === 'assignments' && isManager && (
         <AssignmentsContent 
           employees={managerData?.employees} 
           allClients={managerData?.clients} 
         />
       )}
      </main>
    </div>
  )
}
