"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users } from "lucide-react"
import { ClientIdBadge } from "@/components/client-id-badge"
import { ClientForms } from "@/components/client-forms"
import type { Client, ApplicationFormData, JobMatchFormData } from "@/types/client"
import { useToast } from "@/hooks/use-toast"

export const clients: Client[] = [
  { id: "A1", name: "Jane Doe", slug: "jane-doe", email: "jane.doe@email.com" },
  { id: "A2", name: "Ryan Johnson", slug: "ryan-johnson", email: "ryan.johnson@email.com" },
  { id: "A3", name: "Catherine Klien", slug: "catherine-klien", email: "catherine@designstudio.com" },
]

export function ClientsContent() {
  const [activeClient, setActiveClient] = useState("jane-doe")
  const { toast } = useToast()

  const handleApplicationSubmit = async (data: ApplicationFormData & { clientId: string }) => {
    try {
      console.log("✅ Application submitted:", data)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success toast
      toast({
        title: "✅ Application Submitted!",
        description: `Job application recorded for ${getClientName(data.clientId)}`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Submission Failed",
        description: "There was an error submitting the application. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  const handleJobMatchSubmit = async (data: JobMatchFormData & { clientId: string }) => {
    try {
      console.log("✅ Job match submitted:", data)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success toast
      toast({
        title: "✅ Job Match Recorded!",
        description: `Job match uploaded for ${getClientName(data.clientId)}`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Submission failed:", error)
      toast({
        title: "❌ Upload Failed",
        description: "There was an error uploading the job match. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  // Helper function to get client name from ID
  const getClientName = (clientId: string): string => {
    const client = clients.find((c) => c.id === clientId)
    return client?.name || clientId
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
                Client ID: <ClientIdBadge id={client.id} />
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
