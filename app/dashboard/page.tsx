"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { GenerateEditContent } from "@/components/generate-edit-content"
import { SettingsContent } from "@/components/settings-content"
import { LoadingState } from "@/components/loading-state"
import { ErrorBoundary } from "@/components/error-boundary"
import { useTabsSimple } from "@/hooks/use-tabs-simple"
import { TabId } from "@/lib/tabs"
import { useAuth } from '@/app/providers/AuthProvider'
import { useClients } from "@/hooks/use-clients" // <--- Import the hook here

export default function DashboardPage() {
  const { activeTab, isLoading: tabsLoading, handleTabChange } = useTabsSimple()
  const { user, profile, loading: authLoading, isEmployee } = useAuth()
  const router = useRouter()

  // 1. FETCH DATA ONCE AT PARENT LEVEL
  const { clients, loading: clientsLoading } = useClients()

  useEffect(() => {
    if (!authLoading && !isEmployee) {
      router.push('/login?message=Access denied.')
    }
  }, [authLoading, isEmployee, router])

  if (authLoading || !user) {
    return <LoadingState message="Loading user data..." />
  }

  if (!isEmployee) {
     return <LoadingState message="Redirecting..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)} 
        userFullName={profile?.full_name} 
        userRole={profile?.role}
      />
      
      <main className="p-6" role="tabpanel">
        <ErrorBoundary>
          {tabsLoading ? (
            <LoadingState />
          ) : (
            // 2. PASS DATA DOWN AS PROPS
            <>
              {activeTab === 'dashboard' && (
                <DashboardContent 
                  clients={clients} 
                  isLoading={clientsLoading} 
                />
              )}
              
              {activeTab === 'clients' && (
                <ClientsContent 
                  clients={clients} 
                  isLoading={clientsLoading} 
                />
              )}
              
              {activeTab === 'generate-edit' && (
                <GenerateEditContent />
              )}
              
              {activeTab === 'settings' && (
                <SettingsContent />
              )}
            </>
          )}
        </ErrorBoundary>
      </main>
    </div>
  )
}
