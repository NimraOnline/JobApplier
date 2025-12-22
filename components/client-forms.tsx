// components/client-forms.tsx
"use client"

import { ApplicationForm } from "./application-form"
import { JobMatchForm } from "./job-match-form"
import type { Client, ApplicationFormData, JobMatchFormData } from "@/types/client"

interface ClientFormsProps {
  client: Client
  onApplicationSubmit: (data: ApplicationFormData & { clientId: string }) => void
  onJobMatchSubmit: (data: JobMatchFormData & { clientId: string }) => void
}

export function ClientForms({ 
  client, 
  onApplicationSubmit, 
  onJobMatchSubmit 
}: ClientFormsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ApplicationForm 
        client={client} 
        onSubmit={onApplicationSubmit} 
      />
      <JobMatchForm 
        client={client} 
        onSubmit={onJobMatchSubmit} 
      />
    </div>
  )
}
