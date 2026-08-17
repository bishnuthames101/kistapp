import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkLimit, healthLimiter, tooManyRequests } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"

/**
 * Liveness probe. Unauthenticated by design — a health check that needs a
 * credential is not much use to an uptime monitor — but it does hit the
 * database, so it is limited like everything else. Middleware exempts this
 * path, so the limit has to be applied here.
 */
export async function GET(req: NextRequest) {
  const limitResult = await checkLimit(healthLimiter, getClientIp(req))
  if (!limitResult.success) {
    return tooManyRequests(limitResult, "Too many health checks.")
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
    })
  } catch {
    return NextResponse.json(
      { status: "error", timestamp: new Date().toISOString(), db: "disconnected" },
      { status: 503 }
    )
  }
}
