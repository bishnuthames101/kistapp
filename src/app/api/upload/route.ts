import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { uploadLimiter, checkLimit, tooManyRequests } from "@/lib/ratelimit"
import { getClientIp } from "@/lib/request-ip"

// A bucket missing from this map is rejected by the MIME check below, so
// removing an entry is enough to close the upload path for it.
const ALLOWED_TYPES: Record<string, string[]> = {
  medicines: ["image/jpeg", "image/png", "image/webp"],
  // PRESCRIPTION FEATURE — DISABLED (not deleted). See
  // src/app/api/prescriptions/route.ts. Note that re-enabling this line alone
  // is NOT sufficient: uploads here are handed out via `getPublicUrl()` below,
  // which leaks PHI if the bucket is public. Move to `createSignedUrl()` first.
  // prescriptions: ["image/jpeg", "image/png", "application/pdf"],
  "medical-records": ["application/pdf", "image/jpeg", "image/png"],
}

// The extension is derived from the validated MIME type rather than the
// client-supplied filename, so an attacker cannot pick the stored extension.
const EXTENSION_FOR_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
}

// Only the medicines bucket holds non-sensitive marketing imagery, so it is the
// only one that may be uploaded by a non-admin without extra scrutiny.
const ADMIN_ONLY_BUCKETS: string[] = [STORAGE_BUCKETS.MEDICINES]

// POST /api/upload - Upload file to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError) return authError

    const limitResult = await checkLimit(
      uploadLimiter,
      `${user!.id}:${getClientIp(req)}`
    )
    if (!limitResult.success) {
      return tooManyRequests(limitResult, "Too many uploads. Please try again later.")
    }

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

    // Only staff may publish medicine catalogue images
    if (ADMIN_ONLY_BUCKETS.includes(bucket) && user!.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Validate MIME type against allowed types for bucket
    const allowedTypes = ALLOWED_TYPES[bucket]
    if (!allowedTypes || !allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types for ${bucket}: ${(allowedTypes ?? []).join(", ")}`,
        },
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

    // Generate unique filename. The extension comes from the validated MIME
    // type, never from file.name, which is fully attacker-controlled.
    const fileExt = EXTENSION_FOR_TYPE[file.type]
    const fileName = `${user!.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`

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
