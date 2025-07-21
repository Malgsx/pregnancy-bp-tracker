import { createClient } from "@supabase/supabase-js"

// Primary environment variables
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fallback for production if environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Environment variables missing, using production fallback")
  supabaseUrl = "https://gcbzgtwvuddrmvklkeep.supabase.co"
  supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYnpndHd2dWRkcm12a2xrZWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDcwNDksImV4cCI6MjA2ODYyMzA0OX0.qgl38DE5QgR5Jp2r-cbKKGsD2P5TzXHB0usmMmhDUsE"
}

// Debug environment variables
console.log("Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
console.log("Supabase Anon Key:", supabaseAnonKey ? "✓ Set" : "✗ Missing")
console.log("Using fallback:", !process.env.NEXT_PUBLIC_SUPABASE_URL ? "Yes" : "No")

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Critical error: Supabase configuration failed completely."
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