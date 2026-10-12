import { getSafeReturnTo } from "@/lib/safe-return-to";
import SignUpForm from "./SignUpForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Create account",
  description: "Create a customer account to place and track Addis Eats orders.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const next = getSafeReturnTo(params?.next);

  return (
    <main className="main">
      <SignUpForm next={next} />
    </main>
  );
}