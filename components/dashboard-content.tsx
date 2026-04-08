"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, CheckCircle, Clock } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import type { Client } from "@/types/client"

// Define Props Interface
interface DashboardContentProps {
  clients: any[] // Using any[] to account for the joined job_applications array
  isLoading: boolean
}

export function DashboardContent({ clients = [], isLoading }: DashboardContentProps) {

  // --- REAL DATA CALCULATIONS ---
  const statsData = useMemo(() => {
    let totalApps = 0;
    let pendingApps = 0;
    let appsThisMonth = 0;
    let successApps = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Loop through all clients and their applications
    clients.forEach(client => {
      const apps = client.job_applications || [];
      totalApps += apps.length;

      apps.forEach((app: any) => {
        const status = (app.status || "").toLowerCase();

        // 1. Count Pending
        if (['submitted', 'under_review'].includes(status)) {
          pendingApps++;
        }

        // 2. Count Successes (Interviews, Offers, Accepted)
        if (['interview', 'offer', 'accepted'].includes(status)) {
          successApps++;
        }

        // 3. Count This Month
        if (app.application_date) {
          const appDate = new Date(app.application_date);
          if (appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear) {
            appsThisMonth++;
          }
        }
      });
    });

    // 4. Calculate Success Rate Percentage
    const successRate = totalApps > 0 ? Math.round((successApps / totalApps) * 100) : 0;

    return {
      totalClients: clients.length,
      pendingApps,
      appsThisMonth,
      successRate
    }
  }, [clients]);


  if (isLoading) {
    return <LoadingState message="Loading dashboard stats..." />
  }

  // --- STATS ARRAY ---
  const stats = [
    {
      title: "My Active Clients",
      value: statsData.totalClients.toString(),
      icon: Users,
      description: "Assigned to you",
      color: "text-blue-600",
    },
    {
      title: "Pending Applications",
      value: statsData.pendingApps.toString(),
      icon: Clock,
      description: "Awaiting review",
      color: "text-orange-600",
    },
    {
      title: "Applications Submitted",
      value: statsData.appsThisMonth.toString(),
      icon: FileText,
      description: "This month",
      color: "text-green-600",
    },
    {
      title: "Success Rate",
      value: `${statsData.successRate}%`,
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
          {clients.length > 0 ? (
            <div className="space-y-4">
              {/* Show up to 5 most recent/active clients */}
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shadow-sm">
                      {client.name ? client.name.substring(0, 2).toUpperCase() : "CL"}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Show how many apps they have this month */}
                    <span className="text-xs text-slate-500 hidden sm:inline-block">
                      {client.job_applications?.length || 0} Total Apps
                    </span>

                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-sm text-slate-500">No clients assigned to you yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}