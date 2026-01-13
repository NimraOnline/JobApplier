"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Loader2 } from "lucide-react"
import { ClientIdBadge } from "@/components/client-id-badge"
import { ClientForms } from "@/components/client-forms"
import type { ApplicationFormData, JobMatchFormData } from "@/types/client"
import { useToast } from "@/hooks/use-toast"
// NEW IMPORTS
import { useClients } from "@/hooks/use-clients"
import { submitJobApplication, submitJobMatch } from "@/app/actions/client-actions"

export function ClientsContent() {
  const { clients, loading } = useClients() // <--- Use the hook
  const [activeClient, setActiveClient] = useState<string>("") 
  const { toast } = useToast()

  // Set the first client as active once data loads
  useEffect(() => {
    if (!activeClient && clients.length > 0) {
      setActiveClient(clients[0].slug)
    }
  }, [clients, activeClient])

  // --- HANDLER: JOB APPLICATION ---
  const handleApplicationSubmit = async (data: ApplicationFormData & { clientId: string }) => {
    try {
      await submitJobApplication(data) // <--- Call Server Action

      toast({
        title: "✅ Application Submitted!",
        description: `Job application recorded for ${getClientName(data.clientId)}`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Submission Failed",
        description: error.message || "There was an error submitting the application.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // --- HANDLER: JOB MATCH ---
  const handleJobMatchSubmit = async (data: JobMatchFormData & { clientId: string }) => {
    try {
      await submitJobMatch(data) // <--- Call Server Action

      toast({
        title: "✅ Job Match Recorded!",
        description: `Job match uploaded for ${getClientName(data.clientId)}`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Upload Failed",
        description: error.message || "There was an error uploading the job match.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || "Client"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading clients...</span>
      </div>
    )
  }

  if (clients.length === 0) {
    return <div className="p-6 text-center text-slate-500">No clients found in database.</div>
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Clients
        </h1>
        <p className="text-slate-600">Manage individual client applications and job matches</p>
      </div>

      <Tabs value={activeClient} onValueChange={setActiveClient} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border border-slate-200">
          {clients.map((client) => (
            <TabsTrigger key={client.slug} value={client.slug} className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {client.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {clients.map((client) => (
          <TabsContent key={client.slug} value={client.slug} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {client.name}
              </h2>
              <p className="text-slate-600">
                {/* Display first 8 chars of UUID to act as a short ID */}
                Client ID: <ClientIdBadge id={client.id.substring(0, 8).toUpperCase()} />
              </p>
            </div>

            <ClientForms
              client={client}
              onApplicationSubmit={handleApplicationSubmit}
              onJobMatchSubmit={handleJobMatchSubmit}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
