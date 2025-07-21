import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Demo User",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
        name: { label: "Full Name", type: "text", placeholder: "Your Name" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }

        // Create a demo user object
        const user = {
          id: `demo-${credentials.email}`,
          email: credentials.email,
          name: credentials.name || credentials.email,
          image: null,
        }

        // Try to create or update user profile in Supabase
        try {
          const { data: existingProfile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (!existingProfile) {
            await supabase.from("user_profiles").insert({
              user_id: user.id,
              email: user.email,
              full_name: user.name,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        } catch (error) {
          console.error("Error creating user profile:", error)
        }

        return user
      },
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
      // Allow all demo credential sign-ins
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
      console.log(`Demo user ${user.email} signed in`)
    },
    async signOut({ token }) {
      console.log(`Demo user signed out`)
    },
  },
  debug: process.env.NODE_ENV === "development",
}