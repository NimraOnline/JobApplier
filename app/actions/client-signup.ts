"use server"

import { createActionClient } from "@/lib/supabase/server-action"
import { revalidatePath } from "next/cache"

/**
 * Server Action to create a client via the FastAPI Backend
 */
export async function createClientAction(prevState: any, formData: FormData) {
  // --- HARDCODED URL FOR TESTING ---
  const API_URL = "https://api-interview-getter.onrender.com";
  // ----------------------------------

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  
  // ✅ FIX: Calculate finalTierId BEFORE the fetch call
  const rawTier = formData.get("tierId");
  const finalTierId = (rawTier && parseInt(rawTier as string) > 0) 
    ? parseInt(rawTier as string) 
    : 1; 

  // 1. Get Manager Session
  const supabase = await createActionClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Session expired. Please log in again." };
  }

  console.log(`[DEBUG] Calling Backend: ${API_URL}/api/auth/manager/add-client`);

  try {
    // 2. Call the Render Backend
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
        tier_id: finalTierId // ✅ Now using the validated variable
      }),
      // Adding a timeout signal just in case Render is sleeping
      signal: AbortSignal.timeout(25000) 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        error: errorData.detail || `Backend returned error ${response.status}` 
      };
    }

    // 3. Success
    revalidatePath("/dashboard");
    return { 
      success: true, 
      message: "Successfully created user via Render API." 
    };

  } catch (err: any) {
    console.error("Hardcoded Fetch failed:", err);
    
    if (err.name === 'TimeoutError') {
        return { error: "Backend took too long to respond. It might be waking up. Try again in 30 seconds." };
    }

    return { 
      error: `Failed to connect to ${API_URL}. Is the backend service active?` 
    };
  }
}
