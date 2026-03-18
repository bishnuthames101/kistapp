import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      ),
      user: null
    }
  }

  return { user, error: null }
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      ),
      user: null
    }
  }

  if (user.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
      user: null
    }
  }

  return { user, error: null }
}
