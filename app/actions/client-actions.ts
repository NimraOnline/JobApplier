"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// 1. Define the Validation Schema
const ApplicationSchema = z.object({
  clientId: z.string().uuid(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  // Allow empty string in validation, but we will nullify it before the DB insert
  jobUrl: z.string().url().optional().or(z.literal("")),
  salaryRange: z.string().optional(),
  status: z.enum(['submitted', 'interview', 'offer', 'rejected']).default('submitted'),
  notes: z.string().optional(),
})

export async function submitJobApplication(data: any) {
  const supabase = await createClient()

  // A. Security Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in.")
  }

  // B. Validation Check
  const result = ApplicationSchema.safeParse(data)
  if (!result.success) {
    throw new Error("Invalid data: " + result.error.errors[0].message)
  }

  const { clientId, companyName, jobTitle, jobUrl, salaryRange, status, notes } = result.data

  // C. Permission Check
  const { data: assignment } = await supabase
    .from('client_assignments')
    .select('id')
    .eq('client_id', clientId)
    .eq('employee_id', user.id)
    .single()

  if (!assignment) {
    throw new Error("Unauthorized: You are not assigned to this client.")
  }

  // D. The Insert with NULL handling
  const { error } = await supabase.from("job_applications").insert({
    client_id: clientId,
    submitted_by: user.id,
    company_name: companyName.trim(),
    job_title: jobTitle.trim(),
    // ✅ FIX: Use .trim() || null to convert "" to NULL
    job_url: jobUrl?.trim() || null,
    salary_range: salaryRange?.trim() || null,
    status: status,
    notes: notes?.trim() || null, 
    application_date: new Date().toISOString(),
    application_method: 'portal'
  })

  if (error) {
    console.error("Supabase Error:", error)
    throw new Error("Failed to save application to database.")
  }

  // E. Refresh the Data
  revalidatePath('/dashboard') 
  
  return { success: true }
}

export async function submitJobMatch(data: any) {
  console.log("Job Match Placeholder", data)
  return { success: true }
}
