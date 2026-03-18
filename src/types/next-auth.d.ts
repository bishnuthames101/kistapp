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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone: string
    role: string
    address: string
    lastActivity: number
  }
}
