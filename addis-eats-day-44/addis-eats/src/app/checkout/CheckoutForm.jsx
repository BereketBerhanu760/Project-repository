"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { placeOrder } from "./actions";

const initialState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export default function CheckoutForm({ items }) {
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  if (items.length === 0) {
    if (state.status === "success") {
      return (
        <section className="simple-panel" aria-labelledby="order-confirmation">
          <p className="eyebrow">Order received</p>
          <h1 id="order-confirmation">Almost at the table.</h1>
          <p role="status">{state.message}</p>
          <p className="status">Order reference: {state.orderId}</p>
          <Link className="button" href={`/track/${state.orderId}`}>Track your order</Link>
          <Link className="button" href="/menu">Browse the menu</Link>
        </section>
      );
    }

    return (
      <section className="simple-panel">
        <p className="eyebrow">Checkout</p>
        <h1>Your cart is empty.</h1>
        <p>Add a dish from the menu before placing your order.</p>
        <Link className="button" href="/menu">Browse the menu</Link>
      </section>
    );
  }

  return (
    <form action={formAction} className="checkout-form">
      <h1>Almost at the table.</h1>
      <section className="checkout-summary" aria-label="Order summary">
        {items.map(({ dish, dishId, quantity, subtotal }) => (
          <div className="checkout-summary-row" key={dishId}>
            <span className="checkout-summary-item">
              <Image
                src={dish.image}
                alt={`${dish.imageAlt || dish.name} in your order summary`}
                width={dish.imageWidth}
                height={dish.imageHeight}
                sizes="48px"
              />
              {dish.name} × {quantity}
            </span>
            <strong>{subtotal} Birr</strong>
          </div>
        ))}
        <div className="checkout-summary-row checkout-total">
          <strong>Total</strong>
          <strong>{total} Birr</strong>
        </div>
      </section>

      <label>
        Name
        <input name="name" type="text" autoComplete="name" minLength={2} required />
        {state.fieldErrors?.name ? <span>{state.fieldErrors.name}</span> : null}
      </label>

      <label>
        Phone
        <input name="phone" type="tel" autoComplete="tel" required />
        {state.fieldErrors?.phone ? <span>{state.fieldErrors.phone}</span> : null}
      </label>

      <label>
        Delivery location
        <select name="address" defaultValue="" required>
          <option value="" disabled>Select a delivery location</option>
          <option value="Megenagna">Megenagna</option>
          <option value="Kazanchis">Kazanchis</option>
          <option value="Fiyel bet">Fiyel bet</option>
        </select>
        {state.fieldErrors?.address ? <span>{state.fieldErrors.address}</span> : null}
      </label>

      {state.message ? <p role="status">{state.message}</p> : null}
      {state.signInRequired ? (
        <Link className="text-link" href="/signin?next=%2Fcheckout">Sign in to place your order</Link>
      ) : null}
      {state.orderId ? <p className="status">Order reference: {state.orderId}</p> : null}

      <button type="submit" disabled={isPending}>
        {isPending ? "Placing order…" : "Place order"}
      </button>
    </form>
  );
}
