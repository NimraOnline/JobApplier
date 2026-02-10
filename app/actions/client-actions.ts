"use server"

import { createClient } from "@/lib/supabase/server" // Ensure this path is correct for your project
import { revalidatePath } from "next/cache"
import { z } from "zod"

// 1. Define the Validation Schema (Best Practice)
const ApplicationSchema = z.object({
  clientId: z.string().uuid(),
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobUrl: z.string().url().optional().or(z.literal("")),
  salaryRange: z.string().optional(),
  status: z.enum(['submitted', 'interview', 'offer', 'rejected']).default('submitted'),
  notes: z.string().optional(),
})

// 2. The Actual Function Called by the Form
export async function submitJobApplication(data: any) {
  const supabase = await createClient()

  // A. Security Check: Who is sending this?
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error("Unauthorized: You must be logged in.")
  }

  // B. Validation Check: Is the data clean?
  const result = ApplicationSchema.safeParse(data)
  if (!result.success) {
    throw new Error("Invalid data: " + result.error.errors[0].message)
  }

  const { clientId, companyName, jobTitle, jobUrl, salaryRange, status, notes } = result.data

  // C. Permission Check: Is this employee allowed to work on this client?
  // (Optional but recommended extra layer of security)
  const { data: assignment } = await supabase
    .from('client_assignments')
    .select('id')
    .eq('client_id', clientId)
    .eq('employee_id', user.id)
    .single()

  if (!assignment) {
    throw new Error("Unauthorized: You are not assigned to this client.")
  }

  // D. The Insert (This triggers the Notification automatically!)
  const { error } = await supabase.from("job_applications").insert({
    client_id: clientId,
    submitted_by: user.id,
    company_name: companyName,
    job_title: jobTitle,
    job_url: jobUrl,
    salary_range: salaryRange,
    status: status,
    notes: notes,
    application_date: new Date().toISOString(), // Defaults to "Now"
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

// Placeholder for the Job Match function (to avoid import errors)
export async function submitJobMatch(data: any) {
  // We can implement this later
  console.log("Job Match Placeholder", data)
  return { success: true }
}
