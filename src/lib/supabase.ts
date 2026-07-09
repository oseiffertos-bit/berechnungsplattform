import { createBrowserClient } from '@supabase/ssr'

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          status: string
          form_data: Json
          result_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — nur in Client Components ('use client')
export const createBrowserSupabaseClient = () =>
  createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
