import DemoPage from '@/components/demo-page';

export default async function Page({ params }) {
  const { id } = await params;
  return <DemoPage routeKey="/admin/users/[id]" recordId={id} />;
}
