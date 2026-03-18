import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { authLimiter, getRateLimitHeaders } from "@/lib/ratelimit"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone }
        })

        if (!user || !user.isActive) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          address: user.address || '',
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours max (inactivity handled separately)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // No maxAge means session cookie (cleared on browser close/reload)
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign in, set initial data
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
        token.address = user.address
        token.lastActivity = Date.now()
      }

      // On any request (update trigger), check inactivity timeout
      if (trigger === 'update' || !token.lastActivity) {
        const now = Date.now()
        const lastActivity = token.lastActivity as number || now

        // Different timeouts for admin vs patient
        const inactivityTimeout = token.role === 'admin'
          ? 90 * 1000  // 90 seconds for admin
          : 120 * 1000 // 120 seconds (2 minutes) for patient

        // Check if session has expired due to inactivity
        if (now - lastActivity > inactivityTimeout) {
          // Session expired, return null to force logout
          return null as any
        }

        // Update last activity timestamp
        token.lastActivity = now
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
        session.user.address = token.address as string
        session.user.lastActivity = token.lastActivity as number
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET }

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const params = await context.params
  const isCredentialsSignIn = params.nextauth?.join("/") === "callback/credentials"

  if (isCredentialsSignIn) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"
    const { success, limit, reset, remaining } = await authLimiter.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(limit, remaining, reset) }
      )
    }
  }

  return handler(req, context)
}
