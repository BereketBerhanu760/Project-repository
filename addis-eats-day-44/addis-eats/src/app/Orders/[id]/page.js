import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LegacyOrderPage({ params }) {
  const { id } = await params;
  redirect(`/track/${encodeURIComponent(id)}`);
}
