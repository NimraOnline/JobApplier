"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// --- SCHEMAS ---
const JobAppSchema = z.object({
  clientId: z.string().uuid(),
  companyName: z.string().min(1),
  jobTitle: z.string().min(1),
  jobUrl: z.string().optional(),
  salaryRange: z.string().optional(),
  status: z.string().default('submitted'),
  notes: z.string().optional(),
})

const AssignClientSchema = z.object({
  clientId: z.string().uuid(),
  employeeId: z.string().uuid(),
})

// --- ACTIONS ---

export async function submitJobApplication(formData: any) {
  const supabase = await createClient()
  
  // Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Validate
  const result = JobAppSchema.safeParse(formData)
  if (!result.success) throw new Error("Invalid data")

  // Verify Assignment (Security)
  const { data: assignment } = await supabase
    .from('client_assignments')
    .select('id')
    .eq('client_id', result.data.clientId)
    .eq('employee_id', user.id)
    .eq('is_active', true)
    .single()

  if (!assignment) throw new Error("You are not assigned to this client")

  // Insert
  const { error } = await supabase.from("job_applications").insert({
    client_id: result.data.clientId,
    submitted_by: user.id,
    company_name: result.data.companyName,
    job_title: result.data.jobTitle,
    job_url: result.data.jobUrl,
    salary_range: result.data.salaryRange,
    status: result.data.status,
    notes: result.data.notes,
    application_method: 'portal'
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function assignClient(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const raw = {
    clientId: formData.get('clientId'),
    employeeId: formData.get('employeeId')
  }

  const result = AssignClientSchema.safeParse(raw)
  if (!result.success) return { error: "Invalid ID formats" }

  const { error } = await supabase.from('client_assignments').insert({
    client_id: result.data.clientId,
    employee_id: result.data.employeeId,
    assigned_by: user.id,
    is_active: true
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
