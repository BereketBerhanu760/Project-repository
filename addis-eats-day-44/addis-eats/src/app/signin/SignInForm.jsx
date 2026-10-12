"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "./actions";

const initialState = { status: "idle", message: "" };
const rememberedUsernameKey = "addis-eats:remembered-username";
const signInReturnKey = "addis-eats:signin-return-to";

export default function SignInForm({ next }) {
  const router = useRouter();
  const usernameRef = useRef(null);
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  useEffect(() => {
    const rememberedUsername = window.localStorage.getItem(rememberedUsernameKey);
    if (rememberedUsername && usernameRef.current) usernameRef.current.value = rememberedUsername;
  }, []);

  useEffect(() => {
    if (state.status !== "success") return;

    if (state.rememberUsername) {
      window.localStorage.setItem(rememberedUsernameKey, state.username);
    } else {
      window.localStorage.removeItem(rememberedUsernameKey);
    }
    const returnTo = window.sessionStorage.getItem(signInReturnKey) || state.next || next;
    window.sessionStorage.removeItem(signInReturnKey);
    router.replace(state.role === "staff" ? "/kitchen" : returnTo);
  }, [next, router, state]);

  function rememberReturnPath(event) {
    window.sessionStorage.setItem(signInReturnKey, String(new FormData(event.currentTarget).get("next") || next));
  }

  return (
    <form action={formAction} onSubmit={rememberReturnPath} className="checkout-form signin-form">
      <h1>Welcome back.</h1>
      <p>Sign in to continue to your account.</p>
      <input type="hidden" name="next" value={next} />
      <label>
        Username
        <input ref={usernameRef} name="username" type="text" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <label className="remember-username">
        <input name="rememberUsername" type="checkbox" />
        Remember username on this device
      </label>
      {state.message ? <p role="alert">{state.message}</p> : null}
      <button className="button" type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </button>
      <p className="account-prompt">New here? <Link href={`/signup${next === "/" ? "" : `?next=${encodeURIComponent(next)}`}`}>Create a customer account</Link></p>
    </form>
  );
}
