"use client";
import useSWR from "swr";

export default function OrderStatus({ id, initialData }) {
  const { data, error } = useSWR(`/api/orders/${id}`, {
    fallbackData: initialData,
    refreshInterval: 5000,
  });

  if (error) return <p role="alert">Could not refresh this order status.</p>;
  return <p className="status" aria-live="polite">{data.order.status}</p>;
}