import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"
import {
  passwordResetConfirmLimiter,
  checkLimit,
  tooManyRequests,
} from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"
import {
  MIN_PASSWORD_LENGTH,
  hashResetToken,
  isResetTokenUsable,
} from "@/lib/password-reset"

/**
 * POST /api/auth/password-reset/confirm — redeem a reset token.
 *
 * Expired, already-used and non-existent tokens all produce the same message,
 * so the endpoint cannot be used to probe which tokens ever existed.
 */

const confirmSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
})

const INVALID_TOKEN_MESSAGE =
  "This password reset link is invalid or has expired. Please request a new one."

export async function POST(req: NextRequest) {
  try {
    const limitResult = await checkLimit(passwordResetConfirmLimiter, getClientIp(req))
    if (!limitResult.success) {
      return tooManyRequests(
        limitResult,
        "Too many attempts. Please request a new reset link and try again later."
      )
    }

    const body = await req.json().catch(() => null)
    const parsed = confirmSchema.safeParse(body)

    if (!parsed.success) {
      const passwordIssue = parsed.error.issues.find((issue) =>
        issue.path.includes("password")
      )
      return NextResponse.json(
        { error: passwordIssue?.message ?? INVALID_TOKEN_MESSAGE },
        { status: 400 }
      )
    }

    const { token, password } = parsed.data

    // Looked up by hash — the raw token is never stored.
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
      include: { user: { select: { id: true, isActive: true } } },
    })

    if (!isResetTokenUsable(record) || !record?.user?.isActive) {
      return NextResponse.json({ error: INVALID_TOKEN_MESSAGE }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: {
          password: hashedPassword,
          // Evicts every session issued before now. A reset is what someone
          // does *because* they think they are compromised, so leaving the
          // attacker's existing JWT valid for the rest of its 24 hours would
          // defeat the whole point. Checked in the nextauth jwt callback.
          passwordChangedAt: new Date(),
        },
      }),
      // Single-use: mark this token spent.
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      // And burn every other outstanding token for this user, so an attacker
      // who triggered a parallel request cannot still redeem theirs.
      prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      message: "Your password has been reset. You can now log in.",
    })
  } catch (error) {
    console.error("Password reset confirmation failed:", error)
    return NextResponse.json(
      { error: "Could not reset your password. Please try again." },
      { status: 500 }
    )
  }
}
