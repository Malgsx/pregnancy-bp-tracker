import { createClient } from "@supabase/supabase-js"

// PRODUCTION HARDCODED CONFIGURATION
// This bypasses all environment variable issues
const SUPABASE_URL = "https://gcbzgtwvuddrmvklkeep.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYnpndHd2dWRkcm12a2xrZWVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDcwNDksImV4cCI6MjA2ODYyMzA0OX0.qgl38DE5QgR5Jp2r-cbKKGsD2P5TzXHB0usmMmhDUsE"
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYnpndHd2dWRkcm12a2xrZWVwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA0NzA0OSwiZXhwIjoyMDY4NjIzMDQ5fQ.OqlRzvLyXPwaksnZYSpnoDofUxiIlrfzJQlTELrHf3Y"

console.log("🔧 Using hardcoded Supabase configuration")
console.log("Supabase URL:", SUPABASE_URL ? "✓ Set" : "✗ Missing")
console.log("Supabase Anon Key:", SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing")

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// For server-side operations that require elevated privileges
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)