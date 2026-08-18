import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link preview card, generated at build time from `site.ts` — so it can
 * never drift out of sync with the page the way a hand-exported PNG would.
 *
 * ImageResponse uses Satori, which supports a subset of CSS: flexbox only
 * (every element needs an explicit `display`), no CSS variables, and no
 * external stylesheets. Hence the literal hex colours below.
 */
export default function Image() {
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
          background: "linear-gradient(135deg, #08080b 0%, #14111f 60%, #1a1430 100%)",
          color: "#f2f2f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, color: "#9d84ff" }}>
          {site.location}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            marginTop: 18,
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 44,
            marginTop: 12,
            color: "#9d84ff",
            fontWeight: 600,
          }}
        >
          {site.roles.join("  ·  ")}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 34,
            color: "#9a9aac",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {site.tagline}
        </div>

        {/* accent rule, echoing the site's timeline rails */}
        <div
          style={{
            display: "flex",
            width: 240,
            height: 6,
            marginTop: 46,
            borderRadius: 3,
            background: "#9d84ff",
          }}
        />
      </div>
    ),
    size,
  );
}
