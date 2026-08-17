import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      phone: string
      role: string
      address: string
      lastActivity: number
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    phone: string
    role: string
    address: string
    /** Epoch ms of the last password change; 0 if it has never changed. */
    passwordChangedAt: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone: string
    role: string
    address: string
    lastActivity: number
    /** Epoch ms of the password change this session was issued against. */
    passwordChangedAt: number
  }
}
