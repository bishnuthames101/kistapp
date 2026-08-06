import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { paginated, toDateOnly } from "@/lib/serialize"
import { z } from "zod"

// GET /api/laboratory-tests - Get lab tests (all for admin, user's for patients)
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    // If admin, return all tests with patient details
    // If patient, return only their tests
    const whereClause = user!.role === 'admin'
      ? {}
      : { patientId: user!.id }

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

    const [tests, total] = await prisma.$transaction([
      prisma.laboratoryTest.findMany({
        where: whereClause,
        orderBy: [
          { testDate: "desc" },
          { testTime: "desc" },
        ],
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.laboratoryTest.count({ where: whereClause }),
    ])

    // camelCase, matching Prisma and every other endpoint. This used to be
    // hand-converted to snake_case, which is why the admin page and the
    // patient dashboard disagreed about the field names.
    return NextResponse.json(
      paginated(
        tests.map((test) => ({ ...test, testDate: toDateOnly(test.testDate) })),
        total,
        page,
        limit
      )
    )
  } catch (error) {
    console.error("Error fetching laboratory tests:", error)
    return NextResponse.json(
      { error: "Failed to fetch laboratory tests" },
      { status: 500 }
    )
  }
}

// POST /api/laboratory-tests
const createTestSchema = z.object({
  testName: z.string().min(1, "Test name is required"),
  testDescription: z.string().min(1, "Description is required"),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  testTime: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth()
    if (error) return error

    const body = await req.json()
    const validated = createTestSchema.parse(body)

    // Check if test date is not in the past
    const testDate = new Date(validated.testDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (testDate < today) {
      return NextResponse.json(
        { error: "Test date cannot be in the past" },
        { status: 400 }
      )
    }

    const test = await prisma.laboratoryTest.create({
      data: {
        ...validated,
        testDate,
        patientId: user!.id,
        status: "pending",
      },
    })

    return NextResponse.json(test, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error creating laboratory test:", error)
    return NextResponse.json(
      { error: "Failed to create laboratory test" },
      { status: 500 }
    )
  }
}
