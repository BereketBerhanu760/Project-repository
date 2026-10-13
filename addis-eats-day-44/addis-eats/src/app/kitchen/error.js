"use client";

export default function KitchenError({ retry }) {
  return (
    <main className="main">
      <section className="simple-panel" role="alert">
        <p className="eyebrow">Dashboard unavailable</p>
        <h1>We couldn’t load the dashboard.</h1>
        <p>Please try again. Your order data has not been changed.</p>
        <button className="button" type="button" onClick={() => retry()}>Try again</button>
      </section>
    </main>
  );
}
