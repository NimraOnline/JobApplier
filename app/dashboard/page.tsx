"use client"

import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { GenerateEditContent } from "@/components/generate-edit-content"
import { SettingsContent } from "@/components/settings-content"
import { LoadingState } from "@/components/loading-state"
import { ErrorBoundary } from "@/components/error-boundary"
import { useTabsSimple } from "@/hooks/use-tabs-simple"
import { TabId } from "@/lib/tabs"
import { useAuth } from '@/app/providers/AuthProvider' // Import useAuth
import { useEffect } from 'react' // Import useEffect
import { useRouter } from 'next/navigation' // Import useRouter

const tabComponents = {
  dashboard: DashboardContent,
  clients: ClientsContent,
  "generate-edit": GenerateEditContent,
  settings: SettingsContent,
} as const

export default function DashboardPage() {
  const { activeTab, isLoading: tabsLoading, handleTabChange } = useTabsSimple()
  const { user, profile, loading: authLoading, isEmployee } = useAuth() // Get auth state
  const router = useRouter()

  useEffect(() => {
    // If auth data is loaded and user is not an employee, redirect
    // Middleware should ideally catch this, but this is a client-side fallback
    if (!authLoading && !isEmployee) {
      router.push('/login?message=Access denied. Your account does not have employee access.')
    }
  }, [authLoading, isEmployee, router])

  // If still loading auth state, show a global loading indicator
  if (authLoading || !user) {
    return <LoadingState message="Loading user data..." /> // Create a more descriptive loading state
  }

  // If for some reason the user is here but not an employee after auth loading,
  // it means the middleware likely failed or client-side auth data is inconsistent.
  // Redirect again (though the useEffect above should handle it).
  if (!isEmployee) {
     return <LoadingState message="Redirecting for access check..." /> // Or a static "Access Denied" page
  }

  const ContentComponent = tabComponents[activeTab]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav 
        activeTab={activeTab} 
        onTabChange={(tab) => handleTabChange(tab as TabId)} 
        // Pass employee name/role to TopNav if it displays user info
        userFullName={profile?.full_name} 
        userRole={profile?.role}
      />
      <main className="p-6" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <ErrorBoundary>
          {tabsLoading ? <LoadingState /> : <ContentComponent />}
        </ErrorBoundary>
      </main>
    </div>
  )
}
