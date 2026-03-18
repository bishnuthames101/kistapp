import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/medicines/categories - Get all unique categories
export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    })

    const categories = medicines.map((m: { category: string }) => m.category)

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
