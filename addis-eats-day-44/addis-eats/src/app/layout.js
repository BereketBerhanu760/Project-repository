import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/site-url";
import { getSession } from "@/lib/session";
import SignOutForm from "./SignOutForm";

const geist = localFont({
  src: "./fonts/Geist-Regular.ttf",
  variable: "--font-geist",
  weight: "400",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://project-repository-z5ez.vercel.app/'),
  title: {
    default: "Addis Eats | Ethiopian food, delivered",
    template: "%s | Addis Eats",
  },
  description: "Order Ethiopian favorites from Addis Eats, including slow-cooked stews and freshly prepared classics.",
  openGraph: {
    type: "website",
    siteName: "Addis Eats",
    title: "Addis Eats | Ethiopian food, delivered",
    description: "Order Ethiopian favorites from Addis Eats, including slow-cooked stews and freshly prepared classics.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Addis Eats Ethiopian food, delivered",
      },
    ],
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html lang="en" className={geist.variable}>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link className="brand" href="/">Addis Eats</Link>
            <nav className="nav" aria-label="Main navigation">
              <Link href="/">Home</Link>
              <Link href="/menu">Menu</Link>
              {session?.role !== "staff" ? <Link className="cart-link" href="/cart">Cart</Link> : null}
              {session ? <Link href="/Orders">Orders</Link> : null}
              {session?.role === "staff" ? <Link href="/kitchen">Admin</Link> : null}
              {session ? <SignOutForm /> : (
                <>
                  <Link href="/signin">Sign in</Link>
                  <Link href="/signup">Sign up</Link>
                </>
              )}
            </nav>
          </header>
          {children}
          <footer className="site-footer">Addis Eats · Flavours worth gathering around.</footer>
        </div>
      </body>
    </html>
  );
}
