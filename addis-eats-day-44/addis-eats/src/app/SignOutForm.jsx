import { signOut } from "./signin/actions";

export default function SignOutForm() {
  return (
    <form action={signOut}>
      <button className="text-link nav-signout" type="submit">Sign out</button>
    </form>
  );
}