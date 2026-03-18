import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/medicines/featured - Get featured medicines per category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = parseInt(searchParams.get("limit") || "3")

    // Validate limit parameter (between 1 and 100)
    const limit = Math.min(Math.max(limitParam, 1), 100)

    // Get all categories
    const categoriesData = await prisma.medicine.findMany({
      select: { category: true },
      distinct: ["category"],
    })

    const result: Record<string, any[]> = {}

    // Get limited medicines for each category
    for (const { category } of categoriesData) {
      const medicines = await prisma.medicine.findMany({
        where: { category },
        take: limit,
        orderBy: { name: "asc" },
      })

      // Create category key (lowercase, no spaces)
      const categoryKey = category.toLowerCase().replace(/\s+/g, "")
      result[categoryKey] = medicines
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching featured medicines:", error)
    return NextResponse.json(
      { error: "Failed to fetch featured medicines" },
      { status: 500 }
    )
  }
}
