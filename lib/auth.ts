import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: AuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, token, user }) {
      // Customize session object
      if (session.user && user) {
        session.user.id = user.id
        // Add additional user data from Supabase if needed
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()
        
        if (profile) {
          session.user.profile = profile
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id
      }
      return token
    },
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          // Check if user profile exists in Supabase
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()

          // Create user profile if it doesn't exist
          if (!existingProfile) {
            await supabase.from("user_profiles").insert({
              user_id: user.id,
              email: user.email,
              full_name: user.name,
              avatar_url: user.image,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
          return true
        } catch (error) {
          console.error("Error during sign-in:", error)
          return false
        }
      }
      return true
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log(`User ${user.email} signed in with ${account?.provider}`)
    },
    async signOut({ token }) {
      console.log(`User signed out`)
    },
  },
  debug: process.env.NODE_ENV === "development",
}