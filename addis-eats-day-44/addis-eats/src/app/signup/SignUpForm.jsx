"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "./actions";

const initialState = { message: "" };

export default function SignUpForm({ next }) {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="checkout-form signin-form">
      <h1>Create your account.</h1>
      <p>Choose a username and password to keep your orders together.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        Username
        <input name="username" type="text" autoComplete="username" minLength={3} maxLength={30} required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      </label>
      <label>
        Confirm password
        <input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required />
      </label>
      {state.message ? <p role="alert">{state.message}</p> : null}
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Creating account…" : "Create account"}
      </button>
      <p className="account-prompt">Already have an account? <Link href={`/signin${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`}>Sign in</Link></p>
    </form>
  );
}