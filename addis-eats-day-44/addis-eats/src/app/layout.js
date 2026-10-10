import "./globals.css";
import Link from "next/link";
import localFont from "next/font/local";
import { Providers } from "./providers";

const geist = localFont({
  src: "./fonts/Geist-Regular.ttf",
  variable: "--font-geist",
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: "Addis Eats | Ethiopian food, delivered",
  description: "A small menu of Ethiopian favorites from Addis Eats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <Providers>
          <div className="site-shell">
            <header className="site-header">
              <Link className="brand" href="/">Addis Eats</Link>
              <nav className="nav" aria-label="Main navigation">
                <Link href="/">Home</Link>
                <Link href="/menu">Menu</Link>
                <Link className="cart-link" href="/cart">Cart</Link>
                <Link href="/signin">Sign in</Link>
              </nav>
            </header>
            {children}
            <footer className="site-footer">Addis Eats · Flavours worth gathering around.</footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
