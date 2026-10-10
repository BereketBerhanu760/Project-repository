"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

const initialState = { message: "" };

export default function SignInForm({ next }) {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="checkout-form signin-form">
      <h1>Welcome back.</h1>
      <p>Sign in to continue to your account.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        Username
        <input name="username" type="text" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.message ? <p role="alert">{state.message}</p> : null}
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
