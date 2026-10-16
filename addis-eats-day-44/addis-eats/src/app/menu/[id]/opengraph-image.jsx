import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { connection } from "next/server";
import { getMenuDish } from "@/lib/menu-store";

export const alt = "Addis Eats Ethiopian dish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }) {
  await connection();
  const { id } = await params;
  const dish = await getMenuDish(id);
  if (!dish) notFound();
  const image = await readFile(join(process.cwd(), "public", dish.image.slice(1)));
  const imageSource = `data:image/jpeg;base64,${image.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
        padding: 56,
        background: "#123d2d",
        color: "#fffaf0",
      }}
    >
      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", color: "#f8d47b", fontSize: 25 }}>
          ADDIS EATS · ETHIOPIAN FOOD
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 70, fontWeight: 700 }}>
          {dish.name}
        </div>
        <div style={{ display: "flex", maxWidth: 620, marginTop: 20, fontSize: 27, lineHeight: 1.35 }}>
          {dish.description}
        </div>
        <div style={{ display: "flex", marginTop: 25, color: "#f8d47b", fontSize: 30 }}>
          {dish.price} Birr
        </div>
      </div>
      <div style={{ display: "flex", width: 450, height: 450, overflow: "hidden", borderRadius: 24 }}>
        <img
          src={imageSource}
          alt={dish.name}
          width={450}
          height={450}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>,
    size
  );
}
