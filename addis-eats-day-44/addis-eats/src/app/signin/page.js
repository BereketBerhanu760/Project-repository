import { getSafeReturnTo } from "@/lib/safe-return-to";
import SignInForm from "./SignInForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Sign in",
  description: "Sign in to your Addis Eats account to place an order and track delivery.",
  alternates: { canonical: "/signin" },
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeReturnTo(params?.next);

  return (
    <main className="main">
      <SignInForm next={next} />
    </main>
  );
}
