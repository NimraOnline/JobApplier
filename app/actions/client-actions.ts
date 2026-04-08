"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// 1. Define the Validation Schema
const ApplicationSchema = z.object({
  clientId: z.string().uuid(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url("Must be a valid URL (e.g., https://...)").optional().or(z.literal("")),
  salaryRange: z.string().optional().nullable(),
  status: z.enum(['submitted', 'interview', 'offer', 'rejected']).default('submitted'),
  notes: z.string().optional().nullable(),
})

export async function submitJobApplication(data: any) {
  const supabase = await createClient()

  // A. Security Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: "Unauthorized: You must be logged in." }

  // B. Validation Check
  const result = ApplicationSchema.safeParse(data)
  if (!result.success) return { error: "Invalid data: " + result.error.errors[0].message }

  const { clientId, companyName, jobTitle, jobUrl, salaryRange, status, notes } = result.data

  // C. Permission Check (Allow Managers to bypass assignment check)
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  const isManager = profile?.role === 'manager' || profile?.role === 'admin'

  if (!isManager) {
    const { data: assignment } = await supabase
      .from('client_assignments')
      .select('id')
      .eq('client_id', clientId)
      .eq('employee_id', user.id)
      .eq('is_active', true)
      .maybeSingle() // Use maybeSingle to prevent database crash if 0 rows found

    if (!assignment) return { error: "Unauthorized: You are not assigned to this client." }
  }

  // D. The Insert with NULL handling
  const { error } = await supabase.from("job_applications").insert({
    client_id: clientId,
    submitted_by: user.id,
    company_name: companyName.trim(),
    job_title: jobTitle.trim(),
    job_url: jobUrl?.trim() || null,
    salary_range: salaryRange?.trim() || null,
    status: status,
    notes: notes?.trim() || null,
    application_date: new Date().toISOString(),
    application_method: 'portal'
  })

  if (error) {
    console.error("Supabase Error:", error)
    return { error: "Database error: " + error.message }
  }

  // E. Refresh the Data
  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitJobMatch(data: any) {
  return { success: true }
}