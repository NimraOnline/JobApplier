"use client"

import { useState, useMemo } from "react"
import { submitJobApplication } from "@/app/actions/client-actions"
import { ApplicationForm } from "@/components/application-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, User, Mail, Briefcase, Activity, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { Client } from "@/types/client"

interface ClientsContentProps {
  clients: Client[]
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

  // 3. Handle Form Submission
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
        <p className="text-muted-foreground mt-1">Manage your assigned clients and log job applications.</p>
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

              {/* Application Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                  <ApplicationForm 
                    client={selectedClient} 
                    onSubmit={handleApplicationSubmit} 
                  />
                </div>
                
                {/* Optional: Placeholder for future Client Preferences/Stats */}
                <div className="lg:col-span-1">
                   <Card className="shadow-sm border-slate-200 h-full bg-slate-50/50 border-dashed">
                      <CardContent className="flex flex-col items-center justify-center h-full min-h-[250px] text-center text-slate-500 space-y-2">
                        <Briefcase className="w-8 h-8 opacity-20" />
                        <p className="text-sm font-medium">Application History</p>
                        <p className="text-xs max-w-[200px]">Past job applications for {selectedClient.name} will appear here.</p>
                      </CardContent>
                   </Card>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
