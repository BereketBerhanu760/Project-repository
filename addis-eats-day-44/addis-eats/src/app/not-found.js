import Link from "next/link";

export const metadata = {
  title: "Page not found",
  description: "This Addis Eats page could not be found. Return to the menu to explore available dishes.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <main className="main">
            <div className="simple-panel">
                <p className="eyebrow">404 · page not found</p>
                <Link className="button" href="/menu">Return to menu</Link>
            </div>
        </main>;
}