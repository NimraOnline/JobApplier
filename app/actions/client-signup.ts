"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { revalidatePath } from "next/cache"

export async function createClientAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const tierId = formData.get("tierId") as string
  
  // 1. Get the Manager's Session to prove they are logged in
  const supabase = await createActionClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return { error: "Unauthorized" }

  // DEBUG LOG - Check your Vercel "Logs" tab or Terminal to see this
  console.log("--- DEBUG API CALL ---");
  console.log("Raw Env Var:", process.env.NEXT_PUBLIC_API_URL);
  console.log("Final URL being used:", API_URL || "http://127.0.0.1:8000");
  
  if (!API_URL) {
      return { error: "System Error: NEXT_PUBLIC_API_URL is not defined in environment variables." }
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/manager/add-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send the manager's token so Python knows who is asking
        "Authorization": `Bearer ${session.access_token}` 
      },
      body: JSON.stringify({
        username: name,      // Mapping 'name' form field to 'username' for Python
        email: email,
        password: password,
        role: role,
        tier_id: Number(tierId) // Ensure this is sent as a number/integer
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.detail || "Failed to create client on backend." }
    }

    // 3. Success!
    revalidatePath("/dashboard")
    return { success: true }

  } catch (error) {
    console.error("Backend API Error:", error)
    return { error: "Connection to backend failed." }
  }
}
