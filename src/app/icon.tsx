import { ImageResponse } from "next/og";
import { getAppMode } from "@/lib/app-mode";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default function Icon() {
  const fashion = getAppMode() === "fashion";

  if (fashion) {
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
            borderRadius: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 46,
              borderRadius: 999,
              background: "#fff5f8",
              color: "#c2186b",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            N
          </div>
        </div>
      ),
      { ...size },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #6e1220 0%, #9b1b2e 100%)",
          borderRadius: 14,
          color: "white",
          fontSize: 28,
          fontWeight: 800,
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
