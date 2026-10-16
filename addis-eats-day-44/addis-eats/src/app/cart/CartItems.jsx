"use client";

import Image from "next/image";
import { removeFromCart, updateCartQuantity } from "./actions";

export default function CartItems({ items }) {
  return (
    <>
      <div className="cart-list">
        {items.map(({ dish, dishId, quantity, subtotal }) => (
          <article className="cart-row" key={dishId}>
            <Image
              className="cart-dish-image"
              src={dish.image}
              alt={`${dish.imageAlt || dish.name} in your cart`}
              width={dish.imageWidth}
              height={dish.imageHeight}
              sizes="72px"
            />
            <div className="cart-dish-info">
              <h2>{dish.name}</h2>
              <p>{dish.price} Birr each · {subtotal} Birr</p>
              <div className="cart-quantity" aria-label={`Quantity for ${dish.name}`}>
                <form action={updateCartQuantity}>
                  <input type="hidden" name="dishId" value={dishId} />
                  <button className="quantity-button" type="submit" name="delta" value="-1" aria-label={`Decrease ${dish.name} quantity`}>−</button>
                </form>
                <output aria-live="polite" aria-label={`${quantity} items`}>{quantity}</output>
                <form action={updateCartQuantity}>
                  <input type="hidden" name="dishId" value={dishId} />
                  <button className="quantity-button" type="submit" name="delta" value="1" aria-label={`Increase ${dish.name} quantity`} disabled={quantity >= 10}>+</button>
                </form>
              </div>
            </div>
            <form action={removeFromCart}>
              <input type="hidden" name="dishId" value={dishId} />
              <button className="text-link remove-cart-item" type="submit">Remove</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
