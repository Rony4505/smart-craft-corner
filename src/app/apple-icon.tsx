import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #8e1050 0%, #c2186b 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 130,
            height: 130,
            borderRadius: 999,
            background: "#fff5f8",
            color: "#c2186b",
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1 }}>N</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>NZ</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
