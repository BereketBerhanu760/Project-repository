"use client";

import { downloadCsv } from "@/lib/csv";

const headers = ["Order reference", "Customer", "Items", "Total", "Placed"];

export default function OrderHistoryExport({ rows }) {
  return (
    <button
      className="button order-history-export"
      type="button"
      onClick={() => downloadCsv("addis-eats-order-history.csv", headers, rows)}
    >
      Download order history CSV
    </button>
  );
}
