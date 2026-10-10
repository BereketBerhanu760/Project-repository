import { getSafeReturnTo } from "@/lib/safe-return-to";
import SignInForm from "./SignInForm";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeReturnTo(params?.next);
  if (await getSession()) redirect(next);

  return (
    <main className="main">
      <SignInForm next={next} />
    </main>
  );
}
