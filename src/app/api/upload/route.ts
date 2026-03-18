import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"

const ALLOWED_TYPES: Record<string, string[]> = {
  medicines: ["image/jpeg", "image/png", "image/webp"],
  prescriptions: ["image/jpeg", "image/png", "application/pdf"],
  "medical-records": ["application/pdf", "image/jpeg", "image/png"],
}

// POST /api/upload - Upload file to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const formData = await req.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate bucket
    const validBuckets = Object.values(STORAGE_BUCKETS)
    if (!bucket || !validBuckets.includes(bucket as any)) {
      return NextResponse.json(
        { error: "Invalid bucket. Must be one of: " + validBuckets.join(", ") },
        { status: 400 }
      )
    }

    // Validate MIME type against allowed types for bucket
    const allowedTypes = ALLOWED_TYPES[bucket]
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types for ${bucket}: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Supabase upload error:", error)
      return NextResponse.json(
        { error: "Failed to upload file: " + error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: fileName,
      bucket,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
