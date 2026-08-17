import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import {
  verifyPassword,
  fakeVerifyPassword,
  needsRehash,
  hashPassword,
} from "@/lib/password"
import { NextRequest, NextResponse } from "next/server"
import { authLimiter, checkLimit, tooManyRequests } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"
import { inactivityTimeoutFor } from "@/lib/session-policy"

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

        // Anti-enumeration: when there is no such account (or it is disabled)
        // we still burn the same bcrypt time before failing. Otherwise
        // "unknown phone" returns in ~1ms while "known phone, wrong password"
        // takes ~250ms, and that gap alone tells an attacker which phone
        // numbers belong to patients of this clinic.
        if (!user || !user.isActive) {
          await fakeVerifyPassword(credentials.password)
          throw new Error("Invalid credentials")
        }

        const isValid = await verifyPassword(credentials.password, user.password)

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        // Opportunistically upgrade accounts still on the old cost-10 hash.
        // Done here because it is the only moment we hold the plaintext.
        // Best-effort: a failure here must never block a valid login.
        if (needsRehash(user.password)) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { password: await hashPassword(credentials.password) },
            })
          } catch (err) {
            console.error("Failed to upgrade password hash for", user.id, err)
          }
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
    async jwt({ token, user }) {
      // On sign in, set initial data
      if (user) {
        token.id = user.id
        token.role = user.role
        token.phone = user.phone
        token.address = user.address
        token.lastActivity = Date.now()
      }

      // Enforced on every token read, not only on an explicit update() from
      // the client, so an idle session cannot be kept alive just by never
      // calling update. Any authenticated request counts as activity.
      if (token.id) {
        const now = Date.now()
        const lastActivity = (token.lastActivity as number) || now

        if (now - lastActivity > inactivityTimeoutFor(token.role as string)) {
          return null as any
        }

        // Re-read the account from the database so that a deactivated user or a
        // demoted admin loses access without waiting for the JWT to expire.
        // Throttled to once a minute to keep this off the hot path.
        const lastVerified = (token.lastVerified as number) ?? 0
        if (now - lastVerified > 60 * 1000) {
          const current = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true },
          })

          if (!current || !current.isActive) {
            return null as any
          }

          token.role = current.role
          token.lastVerified = now
        }

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
    // `checkLimit` never throws. Previously an Upstash outage produced a 500
    // here and took login down for the whole clinic; now it degrades to a
    // per-instance in-memory limit instead.
    const limitResult = await checkLimit(authLimiter, getClientIp(req))
    if (!limitResult.success) {
      return tooManyRequests(
        limitResult,
        "Too many login attempts. Please try again later."
      )
    }
  }

  return handler(req, context)
}
