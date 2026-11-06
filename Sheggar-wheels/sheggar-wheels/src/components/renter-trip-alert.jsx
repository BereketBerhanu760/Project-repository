"use client";

import { displayStatus } from "@/components/demo-page-utils";

export default function RenterTripAlert({ bookings = [] }) { const next = bookings.filter((booking) => ["requested", "confirmed", "in_progress"].includes(booking.status)).sort((a, b) => String(a.startDate || "").localeCompare(String(b.startDate || "")))[0]; return <div className="rounded-xl border border-orange-100 bg-orange-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-orange-700">Trip update</p><p className="mt-1 text-sm font-semibold text-slate-800">{next ? (next.status === "requested" ? "Awaiting owner response" : next.car + " · " + next.startDate) : "No upcoming trips"}</p><p className="mt-1 text-xs leading-5 text-slate-600">{next ? "Booking " + next.id + " · " + displayStatus(next.status) : "Your confirmed and requested bookings will appear here."}</p></div>; }
