"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Validation schema
const ClientSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "employee", "manager"]).optional(), // optional because managers will override
  tierId: z.coerce.number().int().positive().optional(), // only for clients
  createdBy: z.string().uuid(),
})

export async function createClientAction(prevState: any, formData: FormData) {
  // 1. Parse and validate input
  const parsed = ClientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    tierId: formData.get("tierId"),
    createdBy: formData.get("createdBy"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { name, email, password, role, tierId, createdBy } = parsed.data

  // 2. Authenticate the caller and check permissions
  const supabase = await createActionClient()
  const { data: { user: caller }, error: authError } = await supabase.auth.getUser()
  if (authError || !caller) return { error: "Unauthorized" }

  // 3. Get caller's profile to determine role
  const { data: callerProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', caller.id)
    .single()

  if (!callerProfile) return { error: "Caller profile not found" }

  const isManager = callerProfile.role === 'manager'
  const isAdmin = callerProfile.role === 'admin'

  if (!isManager && !isAdmin) {
    return { error: "Access denied. Only managers and admins can create users." }
  }

  // 4. Determine the new user's role
  let newUserRole: string
  if (isManager) {
    // Managers can only create clients
    newUserRole = 'client'
  } else {
    // Admins can create any role, but validate input
    if (!role) return { error: "Role is required for admin creation" }
    newUserRole = role
  }

  // 5. Initialize admin client (service role key required)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false }
    }
  )

  // 6. Create auth user with password
  const { data: authUser, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name }
  })

  if (authError2) {
    console.error("Auth creation failed:", authError2)
    return { error: "Failed to create user. Email may already be in use." }
  }

  // 7. Insert into user_profiles (using admin client to bypass RLS)
  const { error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      id: authUser.user.id,
      full_name: name,
      role: newUserRole,
      is_active: true,
      created_at: new Date().toISOString(),
    })

  if (profileError) {
    console.error("Profile insert failed:", profileError)
    // Clean up: delete the auth user we just created
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return { error: "Failed to create user profile. Please try again." }
  }

  // 8. If the new user is a client, create a record in the clients table
  if (newUserRole === 'client') {
    if (!tierId) {
      // Rollback profile and auth user
      await supabaseAdmin.from('user_profiles').delete().eq('id', authUser.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { error: "Tier selection is required for clients." }
    }

    // Generate a unique slug
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabaseAdmin
        .from('clients')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle()
      if (!existing) break
      // Append random suffix
      slug = slug + '-' + Math.random().toString(36).substring(2, 6)
      attempts++
    }

    const { error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        user_id: authUser.user.id,
        name,
        email,
        slug,
        tier_id: tierId,
        status: 'onboarding',
        pre_signup_id: crypto.randomUUID(),
      })

    if (clientError) {
      console.error("Client insert failed:", clientError)
      // Rollback profile and auth user
      await supabaseAdmin.from('user_profiles').delete().eq('id', authUser.user.id)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      return { error: "Failed to create client record. Please try again." }
    }
  }

  revalidatePath('/dashboard')
  return { success: true, message: `User created successfully as ${newUserRole}.` }
}
