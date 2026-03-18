import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authLimiter, getRateLimitHeaders } from "@/lib/ratelimit"

const registerSchema = z.object({
  phone: z.string().length(10).regex(/^9/, "Phone must start with 9"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous"
    const { success, limit, reset, remaining } = await authLimiter.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(limit, remaining, reset) }
      )
    }

    const body = await req.json()

    // Validate input
    const validated = registerSchema.parse(body)

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: validated.phone },
          { email: validated.email }
        ]
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: "User with this phone or email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validated.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        phone: validated.phone,
        password: hashedPassword,
        name: validated.name,
        email: validated.email,
        address: validated.address,
        role: "patient", // Default role
      },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: "User registered successfully",
      user
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
