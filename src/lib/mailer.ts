import { Resend } from "resend"

/**
 * Outbound email.
 *
 * `resend` has been a dependency for a while without a single send site. This
 * is the first one. It is deliberately forgiving: if RESEND_API_KEY is not
 * configured the send is logged instead of throwing, so local development and
 * preview deploys work without credentials and a misconfigured production
 * deploy degrades to "reset link not delivered" rather than a 500 on every
 * forgot-password request.
 *
 * Check the boot log for `[mailer]` warnings if patients report not receiving
 * reset emails.
 */

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

/**
 * Must be a domain verified in Resend, otherwise sends are rejected.
 * Falls back to Resend's shared sandbox sender, which only delivers to the
 * account owner — fine for testing, useless in production.
 */
const FROM = process.env.RESEND_FROM_EMAIL ?? "Kist Poly Clinic <onboarding@resend.dev>"

if (!resend) {
  console.warn(
    "[mailer] RESEND_API_KEY is not set. Emails will be logged to the console " +
      "instead of sent."
  )
}

export type SendResult = { delivered: boolean; reason?: string }

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<SendResult> {
  if (!resend) {
    console.info(
      `[mailer] (not configured) would send to ${params.to}: ${params.subject}\n${params.text}`
    )
    return { delivered: false, reason: "RESEND_API_KEY not configured" }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })

    if (error) {
      console.error("[mailer] Resend rejected the message:", error)
      return { delivered: false, reason: error.message }
    }

    return { delivered: true }
  } catch (err) {
    // Never let a mail failure surface to the caller: the password-reset route
    // must return the same generic response either way, or it becomes an
    // account-enumeration oracle.
    console.error("[mailer] Failed to send:", err)
    return { delivered: false, reason: "send failed" }
  }
}

export function passwordResetEmail(params: { name: string; resetUrl: string; ttlMinutes: number }) {
  const { name, resetUrl, ttlMinutes } = params

  const text = [
    `Hello ${name},`,
    "",
    "We received a request to reset the password for your Kist Poly Clinic account.",
    "",
    `Reset your password: ${resetUrl}`,
    "",
    `This link expires in ${ttlMinutes} minutes and can only be used once.`,
    "",
    "If you did not request this, you can safely ignore this email — your password will not change.",
    "",
    "Kist Poly Clinic, Balkumari, Lalitpur",
  ].join("\n")

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
      <h2 style="color:#1d4ed8;margin-bottom:4px">Kist Poly Clinic</h2>
      <p>Hello ${escapeHtml(name)},</p>
      <p>We received a request to reset the password for your Kist Poly Clinic account.</p>
      <p style="margin:28px 0">
        <a href="${escapeHtml(resetUrl)}"
           style="background:#1d4ed8;color:#fff;padding:12px 22px;border-radius:6px;text-decoration:none;display:inline-block">
          Reset your password
        </a>
      </p>
      <p style="color:#6b7280;font-size:14px">
        This link expires in ${ttlMinutes} minutes and can only be used once.
      </p>
      <p style="color:#6b7280;font-size:14px">
        If you did not request this, you can safely ignore this email — your password will not change.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#9ca3af;font-size:12px">Kist Poly Clinic, Balkumari, Lalitpur</p>
    </div>
  `.trim()

  return { subject: "Reset your Kist Poly Clinic password", html, text }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
