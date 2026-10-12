import "./globals.css";
import localFont from "next/font/local";
import SiteHeader from "./SiteHeader";
import { getSession } from "@/lib/session";

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
          <SiteHeader session={session} />
          {children}
          <footer className="site-footer">Addis Eats · Flavours worth gathering around.</footer>
        </div>
      </body>
    </html>
  );
}
