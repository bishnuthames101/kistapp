import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { z } from "zod"
import { authLimiter, checkLimit, tooManyRequests } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"

const registerSchema = z.object({
  phone: z.string().length(10).regex(/^9/, "Phone must start with 9"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const limitResult = await checkLimit(authLimiter, getClientIp(req))
    if (!limitResult.success) {
      return tooManyRequests(
        limitResult,
        "Too many registration attempts. Please try again later."
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
      // Deliberate trade-off, documented so it is not "fixed" by accident.
      //
      // This response does disclose that *some* account uses one of these two
      // identifiers, which is a mild enumeration signal. It is kept because:
      //   - phone is the login identifier and is UNIQUE, so a truthful
      //     "created" response is impossible; something has to be said;
      //   - staying silent, or claiming success, strands a real patient who
      //     simply forgot they had signed up — the most common case by far;
      //   - it does NOT say which of the two matched, so an attacker cannot
      //     confirm a specific email against a specific phone;
      //   - registration is rate limited to 5 attempts per 15 minutes.
      //
      // The enumeration paths that actually mattered are closed: login now
      // burns equal time on unknown accounts (see src/lib/password.ts), and
      // /api/auth/password-reset always returns the same generic body.
      return NextResponse.json(
        {
          error:
            "An account with this phone number or email already exists. Try logging in, or reset your password.",
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(validated.password)

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
