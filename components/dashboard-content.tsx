"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import { useClients } from "@/hooks/use-clients" // <--- Reuse the hook
import { LoadingState } from "@/components/loading-state"

export function DashboardContent() {
  // Fetch the REAL assigned clients
  const { clients, loading } = useClients()

  if (loading) {
    return <LoadingState message="Loading dashboard stats..." />
  }

  // Calculate stats based on real data
  const totalClients = clients.length
  
  // Note: To get real application counts, you'd need a similar useApplications hook
  // For now, we use the real client count and placeholders for others
  const stats = [
    {
      title: "My Active Clients",
      value: totalClients.toString(), // <--- REAL DATA
      icon: Users,
      description: "Assigned to you",
      color: "text-blue-600",
    },
    {
      title: "Pending Applications",
      value: "12", // Placeholder (requires separate fetch)
      icon: Clock,
      description: "Awaiting review",
      color: "text-orange-600",
    },
    {
      title: "Applications Submitted",
      value: "45", // Placeholder
      icon: FileText,
      description: "This month",
      color: "text-green-600",
    },
    {
      title: "Success Rate",
      value: "24%",
      icon: CheckCircle,
      description: "Interview conversion",
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your clients.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access to Clients */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {totalClients > 0 ? (
            <div className="space-y-4">
               {clients.slice(0, 5).map(client => (
                 <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {client.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <p className="text-xs text-slate-500">{client.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No clients assigned yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
