import Link from "next/link";
import SignOutForm from "./SignOutForm";

export default function SiteHeader({ session }) {
  return (
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
  );
}