import { ImageResponse } from "next/og";

export const alt = "Addis Eats Ethiopian food, delivered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "#123d2d",
        color: "#fffaf0",
        fontSize: 76,
        fontWeight: 700,
      }}
    >
      Addis Eats
    </div>,
    size
  );
}
