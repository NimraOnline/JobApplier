export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          role: 'client' | 'employee' | 'manager' | 'admin'
          full_name: string
          is_active: boolean
          created_at: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string
          slug: string
          tier_id: number
          status: 'onboarding' | 'active' | 'paused' | 'completed' | 'cancelled'
          created_at: string
          // We add this optional property for when we join tables
          client_assignments?: { employee_id: string; is_active: boolean }[]
        }
      }
      client_assignments: {
        Row: {
          id: number
          client_id: string
          employee_id: string
          assigned_by: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          client_id: string
          employee_id: string
          assigned_by: string
          is_active?: boolean
        }
      }
      job_applications: {
        Row: {
          id: number
          client_id: string
          company_name: string
          job_title: string
          status: string
          created_at: string
        }
        Insert: {
          client_id: string
          submitted_by: string
          company_name: string
          job_title: string
          job_url?: string | null
          salary_range?: string | null
          status?: string
          notes?: string | null
          application_method?: string
          application_date?: string
        }
      }
    }
  }
}
