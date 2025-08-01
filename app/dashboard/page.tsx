"use client"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { DashboardContent } from "@/components/dashboard-content"
import { ClientsContent } from "@/components/clients-content"
import { GenerateEditContent } from "@/components/generate-edit-content"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />
      case "clients":
        return <ClientsContent />
      case "generate-edit":
        return <GenerateEditContent />
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="text-slate-600">Manage your account and preferences</p>
            </div>
            <div className="p-8 text-center text-slate-500">Settings panel coming soon...</div>
          </div>
        )
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30">
      <TopNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="p-6">{renderContent()}</main>
    </div>
  )
}
