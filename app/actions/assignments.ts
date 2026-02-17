"use server"

import { createClient } from "@/lib/supabase/server"
import { createActionClient } from "@/lib/supabase/server-action"
import { revalidatePath } from "next/cache"

/**
 * Fetch data required for the Assignment UI
 * Returns all active clients and all staff members (employees/managers)
 */
export async function getAssignmentData() {
  const supabase = await createClient()

  // 1. Fetch All Clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, status')
    .order('name')

  // 2. Fetch All Employees (Staff)
  const { data: employees } = await supabase
    .from('user_profiles')
    .select('id, full_name, role')
    .in('role', ['employee', 'manager'])
    .eq('is_active', true)
    .order('full_name')

  return {
    clients: clients || [],
    employees: employees || []
  }
}

/**
 * Proxy the bulk assignment request to FastAPI
 */
export async function bulkAssignAction(employeeId: string, clientIds: string[]) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-interview-getter.onrender.com";

  // 1. Get Manager Session
  const supabase = await createActionClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return { error: "Session expired. Please log in again." };

  try {
    const response = await fetch(`${API_URL}/api/employees/bulk-assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        employee_id: employeeId,
        client_ids: clientIds
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.detail || "Failed to assign clients." };
    }

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("Bulk Assign Action Error:", error);
    return { error: "Could not connect to the backend server." };
  }
}
