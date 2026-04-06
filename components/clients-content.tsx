"use client"

import { useState, useMemo } from "react"
import { submitJobApplication } from "@/app/actions/client-actions"
import { ApplicationForm } from "@/components/application-form"
import { InterviewForm } from "@/components/dashboard/interview-form" // ✅ NEW IMPORT
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  User,
  Mail,
  Briefcase,
  Activity,
  ChevronRight,
  CheckCircle2,
  Building2,
  CalendarCheck
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// If you have a strict Client type, you might need to extend it to include job_applications
interface ClientsContentProps {
  clients: any[] // Using any[] to safely handle the joined job_applications data
  isLoading?: boolean
}

export function ClientsContent({ clients = [], isLoading }: ClientsContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(
    clients.length > 0 ? clients[0].id : null
  )

  // 1. Filter the sidebar list
  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients
    const lowerQuery = searchQuery.toLowerCase()
    return clients.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.email.toLowerCase().includes(lowerQuery)
    )
  }, [clients, searchQuery])

  // 2. Find the currently active client object
  const selectedClient = clients.find(c => c.id === selectedClientId)

  // 3. Filter for Success Applications (Interviews, Offers, Accepted)
  const successApplications = useMemo(() => {
    if (!selectedClient || !selectedClient.job_applications) return []
    return selectedClient.job_applications.filter((app: any) =>
      ['interview', 'offer', 'accepted'].includes((app.status || '').toLowerCase())
    ).sort((a: any, b: any) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
  }, [selectedClient])

  // 4. Handle Standard Application Submission
  const handleApplicationSubmit = async (data: any) => {
    try {
      const result = await submitJobApplication(data)
      if (result.success) {
        toast.success(`Application submitted for ${selectedClient?.name}!`)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit application")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading clients...</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-8rem)] min-h-[600px] flex flex-col">
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Briefcase className="text-blue-600" /> My Clients
        </h1>
        <p className="text-muted-foreground mt-1">Manage your assigned clients, log applications, and track interviews.</p>
      </div>

      {/* Master-Detail Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">

        {/* LEFT PANEL: The "Master" List */}
        <Card className="md:col-span-4 lg:col-span-3 flex flex-col shadow-sm border-slate-200 overflow-hidden bg-white/50">
          <div className="p-4 border-b border-slate-100 bg-white shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clients..."
                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredClients.length === 0 ? (
                <div className="text-center p-6 text-sm text-slate-500">
                  No clients found.
                </div>
              ) : (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group",
                      selectedClientId === client.id
                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className={cn(
                        "font-semibold text-sm truncate",
                        selectedClientId === client.id ? "text-blue-900" : "text-slate-700"
                      )}>
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{client.email}</p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 shrink-0 transition-opacity",
                      selectedClientId === client.id ? "text-blue-500 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100"
                    )} />
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* RIGHT PANEL: The "Detail" View */}
        <div className="md:col-span-8 lg:col-span-9 flex flex-col min-h-0 overflow-y-auto pr-2 pb-6">
          {!selectedClient ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <User className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">No Client Selected</h3>
              <p className="text-slate-500 text-sm mt-1">Select a client from the sidebar to view their details and log applications.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

              {/* Client Profile Summary Card */}
              <Card className="shadow-sm border-slate-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">{selectedClient.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {selectedClient.email}</span>
                        <span className="flex items-center gap-1.5 capitalize">
                          <Activity className="w-4 h-4 text-slate-400" />
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            selectedClient.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {selectedClient.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* FORMS GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Left Column: Standard Application Form */}
                {/* 1. Update the Left Column: Standard Application Form */}
                <div className="xl:col-span-1">
                  <ApplicationForm
                    key={`app-form-${selectedClient.id}`}  {/* ✅ ADD THIS KEY */}
                    client={selectedClient}
                    onSubmit={handleApplicationSubmit}
                  />
                </div>

                {/* Right Column: Interview Form & Success History */}
                <div className="xl:col-span-1 flex flex-col gap-6">

                  {/* 2. Update the Log Interview Card */}
                  <Card className="shadow-sm border-green-200 bg-green-50/30">
                    <CardHeader className="pb-4 border-b border-green-100 mb-4 bg-green-50/50">
                      <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5" /> Log Job Interview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InterviewForm
                        key={`int-form-${selectedClient.id}`}  {/* ✅ ADD THIS KEY */}
                        clientId={selectedClient.id}
                      />
                    </CardContent>
                  </Card>

                  {/* 2. Success Applications Feed */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b pb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Success Milestones
                    </h3>

                    {successApplications.length === 0 ? (
                      <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm italic bg-slate-50/50">
                        No success milestones logged yet for this client.
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto pr-2 pb-4">
                        {successApplications.map((app: any) => (
                          <Card key={app.id} className="border-l-4 border-l-green-500 shadow-sm bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-sm text-slate-900 truncate">{app.job_title}</h4>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-[9px] px-1.5 py-0">
                                      {app.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                                    <Building2 className="w-3 h-3 shrink-0" /> {app.company_name}
                                  </p>
                                </div>

                                <div className="text-right text-[10px] text-slate-400 shrink-0">
                                  <p className="font-medium text-slate-500">
                                    {new Date(app.application_date).toLocaleDateString()}
                                  </p>
                                  <p className="capitalize">{app.application_method}</p>
                                </div>
                              </div>

                              {app.notes && (
                                <div className="mt-2 p-2 bg-slate-50 rounded text-[11px] text-slate-600 border border-slate-100 line-clamp-2">
                                  <span className="font-semibold text-slate-700">Notes:</span> {app.notes}
                                </div>
                              )}

                              {app.job_url && (
                                <div className="mt-2 flex justify-end">
                                  <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-blue-600" asChild>
                                    <a href={app.job_url} target="_blank" rel="noreferrer">View Posting →</a>
                                  </Button>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}