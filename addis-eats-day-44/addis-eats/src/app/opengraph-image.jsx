import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Addis Eats Ethiopian food, delivered";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  let imageData = null;
  try {
    const filePath = join(process.cwd(), "src", "app", "opengraph-image.jpg");
    imageData = await readFile(filePath);
  } catch (error) {
    console.error("Could not load OpenGraph background image:", error);
  }

  const imageSrc = imageData 
    ? `data:image/jpeg;base64,${Buffer.from(imageData).toString("base64")}` 
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
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
        {imageSrc && (
          <img
            src={imageSrc}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.4,
            }}
          />
        )}

        <div style={{ display: "flex", zIndex: 1, position: "relative" }}>
          Addis Eats
        </div>
      </div>
    ),
    size
  );
}