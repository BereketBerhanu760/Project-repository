import Link from "next/link";

export default function NotFound() {
  return <main className="main">
            <div className="simple-panel">
                <p className="eyebrow">404 · Off the menu</p>
                <h1>We could not find that dish.</h1>
                <p>It may have sold out.</p>
                <Link className="button" href="/menu">Return to menu</Link>
            </div>
        </main>;
}