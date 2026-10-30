import DemoPage from "@/components/demo-page";

export default async function Page({ params }) {
  const { id } = await params;
  return <DemoPage routeKey="/owner/bookings/[id]" recordId={id} />;
}
