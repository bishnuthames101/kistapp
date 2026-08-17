import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { passwordResetLimiter, checkLimit, tooManyRequests } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"
import { sendEmail, passwordResetEmail } from "@/lib/mailer"
import {
  RESET_TOKEN_TTL_MS,
  buildResetUrl,
  generateResetToken,
  hashResetToken,
  resetTokenExpiry,
} from "@/lib/password-reset"

/**
 * POST /api/auth/password-reset — request a reset link.
 *
 * ALWAYS returns the same 200 body, whether or not the email belongs to a real
 * account. That is deliberate: a "no account with that email" response turns
 * this endpoint into an account-enumeration oracle, letting anyone test whether
 * a given person is a patient of the clinic. Errors are logged server-side.
 */

const requestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

// The single response every caller gets.
const GENERIC_RESPONSE = {
  message:
    "If an account exists for that email address, we have sent a password reset link. Please check your inbox.",
}

export async function POST(req: NextRequest) {
  try {
    const limitResult = await checkLimit(passwordResetLimiter, getClientIp(req))
    if (!limitResult.success) {
      return tooManyRequests(
        limitResult,
        "Too many password reset requests. Please try again later."
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = requestSchema.safeParse(body)

    // A malformed email is a client bug, not an enumeration signal, so this one
    // may be reported honestly.
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a valid email address" },
        { status: 400 }
      )
    }

    const email = parsed.data.email.trim().toLowerCase()

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, isActive: true },
      select: { id: true, name: true, email: true },
    })

    if (user) {
      const token = generateResetToken()

      await prisma.$transaction([
        // Invalidate any outstanding tokens so a user who clicks "forgot
        // password" three times cannot leave three live links in their inbox.
        prisma.passwordResetToken.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashResetToken(token),
            expiresAt: resetTokenExpiry(),
          },
        }),
      ])

      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ??
        process.env.NEXTAUTH_URL ??
        new URL(req.url).origin

      const { subject, html, text } = passwordResetEmail({
        name: user.name,
        resetUrl: buildResetUrl(baseUrl, token),
        ttlMinutes: Math.round(RESET_TOKEN_TTL_MS / 60000),
      })

      // Failures are logged inside sendEmail and never change the response.
      await sendEmail({ to: user.email, subject, html, text })
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error("Password reset request failed:", error)
    // Even on an internal error, do not vary the response by account existence.
    return NextResponse.json(GENERIC_RESPONSE)
  }
}
