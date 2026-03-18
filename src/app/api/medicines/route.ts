import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { z } from "zod"

// GET /api/medicines - List all medicines with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const inStock = searchParams.get("in_stock")
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))

    const where: any = {}

    // Filter by category
    if (category) {
      where.category = { equals: category, mode: "insensitive" }
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    // Filter by stock status
    if (inStock === "true") {
      where.stock = "IN_STOCK"
    }

    // Filter by price range (validate positive numbers)
    if (minPrice) {
      const minPriceNum = parseFloat(minPrice)
      if (!isNaN(minPriceNum) && minPriceNum >= 0) {
        where.price = { ...where.price, gte: minPriceNum }
      }
    }
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice)
      if (!isNaN(maxPriceNum) && maxPriceNum >= 0) {
        where.price = { ...where.price, lte: maxPriceNum }
      }
    }

    const [medicines, total] = await prisma.$transaction([
      prisma.medicine.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.medicine.count({ where }),
    ])

    return NextResponse.json({
      data: medicines,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    )
  }
}

// POST /api/medicines - Create new medicine (admin only)
const createMedicineSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  image: z.string().optional(),
  category: z.string().min(1),
  stock: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).default("IN_STOCK"),
})

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const { user, error } = await requireAdmin()
    if (error) return error

    const body = await req.json()
    const validated = createMedicineSchema.parse(body)

    const medicine = await prisma.medicine.create({
      data: validated,
    })

    return NextResponse.json(medicine, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as any).errors },
        { status: 400 }
      )
    }

    console.error("Error creating medicine:", error)
    return NextResponse.json(
      { error: "Failed to create medicine" },
      { status: 500 }
    )
  }
}
