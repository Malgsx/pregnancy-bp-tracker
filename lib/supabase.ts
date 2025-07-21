import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug environment variables
console.log("Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
console.log("Supabase Anon Key:", supabaseAnonKey ? "✓ Set" : "✗ Missing")

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Environment variables status:", {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || "undefined",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? "[REDACTED]" : "undefined"
  })
  throw new Error(
    "Missing Supabase environment variables. Please check your Vercel environment configuration."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations that require elevated privileges
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)