"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { revalidatePath } from "next/cache"

export async function createClientAction(prevState: any, formData: FormData) {
  // 1. Get the URL from Environment Variables
  // Note: No "K" at the end of PUBLIC
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // 2. Safety Check: If the variable is missing, stop immediately with a clear error
  if (!API_URL) {
    console.error("CRITICAL ERROR: NEXT_PUBLIC_API_URL is not defined in environment variables.");
    return { error: "System configuration error: API_URL is missing. Please check Vercel settings." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  
  // Logic to prevent the "Tier 0" database error
  const rawTier = formData.get("tierId");
  const finalTierId = (rawTier && parseInt(rawTier as string) > 0) 
    ? parseInt(rawTier as string) 
    : 1; 

  // 3. Get Manager Session
  const supabase = await createActionClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Session expired. Please log in again." };
  }

  try {
    // 4. Call the Backend using the variable
    const response = await fetch(`${API_URL}/api/auth/manager/add-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        username: name,
        email: email,
        password: password,
        role: role || "client",
        tier_id: finalTierId
      }),
      signal: AbortSignal.timeout(25000) 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.detail || `Backend error: ${response.status}` 
      };
    }

    revalidatePath("/dashboard");
    return { 
      success: true, 
      message: "Successfully created user via Backend API." 
    };

  } catch (err: any) {
    console.error("Fetch failed:", err);
    if (err.name === 'TimeoutError') {
        return { error: "Backend took too long to respond. Try again in a moment." };
    }
    return { 
      error: `Could not connect to the API at ${API_URL}.` 
    };
  }
}
