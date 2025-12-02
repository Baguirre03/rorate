import { ImageResponse } from "next/og";

// Image metadata - Google requires at least 48x48, but 96x96 is better
export const size = {
  width: 96,
  height: 96,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 96,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Background circle */}
        <div
          style={{
            position: "absolute",
            width: 90,
            height: 90,
            borderRadius: "50%",
            backgroundColor: "rgba(10, 10, 10, 0.1)",
          }}
        />
        {/* Trending up arrow/chart */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 32 32"
          fill="none"
          stroke="rgb(10, 10, 10)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 20 L12 16 L16 18 L24 10" />
          <path d="M20 10 L24 10 L24 14" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
