import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"

// TODO: Replace with actual database integration
// For now, using mock users
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@company.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyJSs/4NdVGu", // "admin123"
    role: "Super Admin"
  },
  {
    id: "2",
    name: "John Doe",
    email: "john.doe@company.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyJSs/4NdVGu", // "admin123"
    role: "Admin"
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // TODO: Replace with actual database query
        const user = mockUsers.find(u => u.email === credentials.email)

        if (!user) {
          throw new Error("Invalid credentials")
        }

        // Verify password
        const isValidPassword = await compare(credentials.password, user.password)

        if (!isValidPassword) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // TODO: Add custom sign-in logic
      // For example, check if user is allowed to access the admin dashboard

      if (account?.provider === "google") {
        // TODO: Check if email is in allowed list or database
        const allowedDomains = ["company.com"]
        const email = user.email || ""
        const domain = email.split("@")[1]

        if (!allowedDomains.includes(domain)) {
          return false
        }
      }

      return true
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
