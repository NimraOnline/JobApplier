"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const ClientSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email address"),
  tierId: z.coerce.number().int().positive("Please select a tier"),
})

export async function createClientAction(prevState: any, formData: FormData) {
  // 1. Parse and validate input
  const parsed = ClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    tierId: formData.get("tierId"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { name, email, tierId } = parsed.data

  // 2. Create Supabase client (write‑capable)
  const supabase = await createActionClient()

  // 3. Authenticate user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "You must be logged in." }
  }

  // 4. Authorise: only managers/admins
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['manager', 'admin'].includes(profile.role)) {
    return { error: "Access denied. Only managers can add clients." }
  }

  // 5. Generate a unique slug from the company name
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  // Check if slug already exists
  const { data: existingSlug } = await supabase
    .from('clients')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (existingSlug) {
    // Append a short random string to make it unique
    const suffix = Math.random().toString(36).substring(2, 6)
    slug = `${slug}-${suffix}`
  }

  // 6. Insert the new client
  const { data: newClient, error } = await supabase
    .from('clients')
    .insert({
      name,
      email,
      slug,
      tier_id: tierId,
      status: 'onboarding',
      pre_signup_id: crypto.randomUUID(), // Generate a UUID for the invitation link
    })
    .select()
    .single()

  if (error) {
    console.error('Insert client error:', error)

    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.message.includes('email')) {
        return { error: "A client with this email already exists." }
      }
      if (error.message.includes('slug')) {
        return { error: "A client with a similar name already exists. Please try again." }
      }
    }
    return { error: "Failed to create client. Please try again." }
  }

  // 7. (Optional) Automatically assign the creating manager to this client
  const { error: assignError } = await supabase
    .from('client_assignments')
    .insert({
      client_id: newClient.id,
      employee_id: user.id,
      assigned_by: user.id,
      is_active: true,
      assigned_at: new Date().toISOString(),
    })

  if (assignError) {
    console.error('Auto-assignment failed:', assignError)
    // Don't fail the whole operation – client is still created
  }

  // 8. Revalidate dashboard cache
  revalidatePath('/dashboard')

  return { success: true, client: newClient }
}
