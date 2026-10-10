import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDish } from "../data";

export const alt = "Addis Eats Ethiopian dish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  const { id } = await params;
  const dish = getDish(id);
  if (!dish) notFound();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        padding: "72px",
        background: "#123d2d",
        color: "#fffaf0",
      }}
    >
      <div style={{ display: "flex", color: "#f8d47b", fontSize: 30 }}>
        ADDIS EATS · ETHIOPIAN FOOD
      </div>
      <div style={{ display: "flex", marginTop: 26, fontSize: 76, fontWeight: 700 }}>
        {dish.name}
      </div>
      <div style={{ display: "flex", maxWidth: 1000, marginTop: 22, fontSize: 32 }}>
        {dish.description}
      </div>
      <div style={{ display: "flex", marginTop: 26, color: "#f8d47b", fontSize: 32 }}>
        {dish.price} Birr
      </div>
    </div>,
    size
  );
}
