"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Loader2 } from "lucide-react"
import { ClientIdBadge } from "@/components/client-id-badge"
import { ClientForms } from "@/components/client-forms"
import type { ApplicationFormData, JobMatchFormData, Client } from "@/types/client"
import { useToast } from "@/hooks/use-toast"
import { submitJobApplication, submitJobMatch } from "@/app/actions/client-actions"

// Define Props Interface
interface ClientsContentProps {
  clients: Client[]
  isLoading: boolean
}

export function ClientsContent({ clients, isLoading }: ClientsContentProps) {
  // Removed useClients() hook call
  const [activeClient, setActiveClient] = useState<string>("") 
  const { toast } = useToast()

  // Set the first client as active once data loads
  useEffect(() => {
    // If we have clients but no active tab selected yet, select the first one
    if (!activeClient && clients.length > 0) {
      setActiveClient(clients[0].slug)
    }
    // If we have an active tab but it's not in the new list (e.g. lost access), reset to first
    else if (activeClient && clients.length > 0 && !clients.find(c => c.slug === activeClient)) {
        setActiveClient(clients[0].slug)
    }
  }, [clients, activeClient])

  const handleApplicationSubmit = async (data: ApplicationFormData & { clientId: string }) => {
    try {
      await submitJobApplication(data)
      toast({
        title: "✅ Application Submitted!",
        description: `Job application recorded.`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Submission Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleJobMatchSubmit = async (data: JobMatchFormData & { clientId: string }) => {
    try {
      await submitJobMatch(data)
      toast({
        title: "✅ Job Match Recorded!",
        description: `Job match uploaded.`,
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Upload Failed",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-slate-600">Loading clients...</span>
      </div>
    )
  }

  if (clients.length === 0) {
    return <div className="p-6 text-center text-slate-500">No clients assigned to you found.</div>
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
