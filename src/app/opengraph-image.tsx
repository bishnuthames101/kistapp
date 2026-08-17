import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = `${siteConfig.name} - Quality healthcare in Lalitpur, Nepal`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build/request time so the social card never drifts from the
// site config, and no binary asset has to be checked into the repo.
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#fde047",
            marginBottom: 24,
          }}
        >
          Balkumari, Lalitpur
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 86,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 28,
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: "#dbeafe",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Doctor consultations, in-house lab tests and online pharmacy
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 30,
            color: "#fde047",
          }}
        >
          {siteConfig.telephone}
        </div>
      </div>
    ),
    size
  );
}
