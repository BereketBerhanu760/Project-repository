import "./globals.css";

export const metadata = {
  title: {
    default: "Sheggar Wheels | Premium car rentals",
    template: "%s | Sheggar Wheels",
  },
  description: "Browse and book premium demo rental cars in Addis Ababa with Sheggar Wheels.",
  applicationName: "Sheggar Wheels",
  openGraph: {
    title: "Sheggar Wheels | Premium car rentals",
    description: "Browse and book premium demo rental cars in Addis Ababa.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
