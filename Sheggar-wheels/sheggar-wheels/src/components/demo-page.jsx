"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  readAnnouncements,
  readBookings,
  readCars,
  readCheckoutDraft,
  readDisputes,
  readReviews,
  readUsers,
  writeAnnouncements,
  writeBookings,
  writeCars,
  writeCheckoutDraft,
  writeDisputes,
  writeReviews,
  writeSession,
  writeUsers,
} from "@/lib/storage";
import { getCurrentSession, requireRole, safeReturnPath, signInAsDemo, signOut as signOutDemo } from "@/lib/auth";

const DEMO_OWNER = { id: "demo-owner", name: "Maya Bekele", email: "owner@sheggarwheels.demo", phone: "+251 911 000 201", roles: ["renter", "owner"], status: "Active", createdAt: "2026-01-12T09:00:00.000Z", seeded: true };
const DEMO_RENTER = { id: "demo-renter", name: "Daniel Tesfaye", email: "renter@sheggarwheels.demo", phone: "+251 911 000 202", roles: ["renter"], status: "Active", createdAt: "2026-02-03T09:00:00.000Z", seeded: true };
const DEMO_ADMIN = { id: "demo-admin", name: "Sheggar Demo Admin", email: "admin@sheggarwheels.demo", phone: "", roles: ["admin"], status: "Active", createdAt: "2026-01-01T09:00:00.000Z", seeded: true };
const bookingTransitions = Object.freeze({
  requested: ["confirmed", "declined", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "disputed"],
  completed: ["reviewed"],
  disputed: ["resolved"],
});

function normalizeBookingStatus(value) {
  const status = String(value || "requested").toLowerCase().replaceAll(" ", "_");
  return ({ active: "in_progress", pending: "requested" })[status] || status;
}

function displayStatus(value) {
  return String(value || "pending").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
const demoCars = [
  { id: "car-audi-r8", ownerId: DEMO_OWNER.id, make: "Audi", model: "R8 V10", year: 2023, name: "Audi R8 V10", category: "Exotic", location: "Bole International Airport", neighbourhood: "Bole", latitude: 8.9806, longitude: 38.7578, price: 285, pricePerDay: 285, seats: 2, transmission: "Automatic", status: "Approved", photos: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1000&q=80"], description: "A striking V10 sports car for a memorable city drive.", unavailableDates: [], accent: "from-red-500/30", createdAt: "2026-03-01T10:00:00.000Z" },
  { id: "car-range-rover", ownerId: DEMO_OWNER.id, make: "Land Rover", model: "Range Rover Sport", year: 2024, name: "Range Rover Sport", category: "Premium SUV", location: "Addis Ababa", neighbourhood: "Kazanchis", latitude: 9.0102, longitude: 38.7613, price: 190, pricePerDay: 190, seats: 5, transmission: "Automatic", status: "Approved", photos: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80"], description: "Comfortable premium SUV with room for the whole group.", unavailableDates: [], accent: "from-amber-500/30", createdAt: "2026-03-04T10:00:00.000Z" },
  { id: "car-mercedes-s", ownerId: DEMO_OWNER.id, make: "Mercedes-Benz", model: "S-Class", year: 2023, name: "Mercedes-Benz S-Class", category: "Luxury", location: "Bole International Airport", neighbourhood: "Bole", latitude: 8.9806, longitude: 38.7578, price: 220, pricePerDay: 220, seats: 5, transmission: "Automatic", status: "Approved", photos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80"], description: "Quiet, refined executive travel through the capital.", unavailableDates: [], accent: "from-blue-500/30", createdAt: "2026-03-06T10:00:00.000Z" },
  { id: "car-bmw-5", ownerId: DEMO_OWNER.id, make: "BMW", model: "5 Series", year: 2022, name: "BMW 5 Series", category: "Luxury", location: "Bole, Addis Ababa", neighbourhood: "Bole", latitude: 8.995, longitude: 38.785, price: 165, pricePerDay: 165, seats: 5, transmission: "Automatic", status: "Approved", photos: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80"], description: "A balanced luxury sedan for business or a weekend away.", unavailableDates: [], accent: "from-slate-500/30", createdAt: "2026-03-09T10:00:00.000Z" },
  { id: "car-toyota-land-cruiser", ownerId: DEMO_OWNER.id, make: "Toyota", model: "Land Cruiser", year: 2021, name: "Toyota Land Cruiser", category: "Premium SUV", location: "Old Airport, Addis Ababa", neighbourhood: "Old Airport", latitude: 8.99, longitude: 38.77, price: 175, pricePerDay: 175, seats: 7, transmission: "Automatic", status: "Approved", photos: ["https://images.unsplash.com/photo-1519245659620-e859806a8d3b?auto=format&fit=crop&w=1000&q=80"], description: "Spacious all-terrain comfort for longer journeys.", unavailableDates: [], accent: "from-emerald-500/30", createdAt: "2026-03-12T10:00:00.000Z" },
  { id: "car-porsche-911", ownerId: DEMO_OWNER.id, make: "Porsche", model: "911 Carrera", year: 2023, name: "Porsche 911 Carrera", category: "Exotic", location: "Bole International Airport", neighbourhood: "Bole", latitude: 8.9806, longitude: 38.7578, price: 310, pricePerDay: 310, seats: 2, transmission: "Manual", status: "Approved", photos: ["https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80"], description: "An engaging sports coupe for a special occasion.", unavailableDates: [], accent: "from-orange-500/30", createdAt: "2026-03-15T10:00:00.000Z" },
  { id: "car-hyundai-tucson", ownerId: DEMO_OWNER.id, make: "Hyundai", model: "Tucson", year: 2022, name: "Hyundai Tucson", category: "SUV", location: "Piazza, Addis Ababa", neighbourhood: "Piazza", latitude: 9.035, longitude: 38.75, price: 95, pricePerDay: 95, seats: 5, transmission: "Automatic", status: "Pending review", photos: ["https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80"], description: "A practical compact SUV awaiting listing approval.", unavailableDates: [], accent: "from-cyan-500/30", createdAt: "2026-03-18T10:00:00.000Z" },
  { id: "car-honda-civic", ownerId: DEMO_OWNER.id, make: "Honda", model: "Civic", year: 2021, name: "Honda Civic", category: "Sedan", location: "Megenagna, Addis Ababa", neighbourhood: "Megenagna", latitude: 9.02, longitude: 38.81, price: 72, pricePerDay: 72, seats: 5, transmission: "Manual", status: "Inactive", photos: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80"], description: "An efficient city sedan currently unavailable for booking.", unavailableDates: [], accent: "from-violet-500/30", createdAt: "2026-03-21T10:00:00.000Z" },
];

const demoBookings = [
  { id: "SW-24018", carId: "car-audi-r8", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-28", endDate: "2026-10-30", days: 2, pricePerDay: 285, subtotal: 570, serviceFee: 35, total: 605, paymentStatus: "Mock unpaid", status: "requested", createdAt: "2026-10-20T10:00:00.000Z", updatedAt: "2026-10-20T10:00:00.000Z" },
  { id: "SW-24017", carId: "car-range-rover", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-24", endDate: "2026-10-26", days: 2, pricePerDay: 190, subtotal: 380, serviceFee: 35, total: 415, paymentStatus: "Mock held", status: "confirmed", createdAt: "2026-10-18T10:00:00.000Z", updatedAt: "2026-10-19T10:00:00.000Z" },
  { id: "SW-24014", carId: "car-porsche-911", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-27", endDate: "2026-10-29", days: 2, pricePerDay: 310, subtotal: 620, serviceFee: 35, total: 655, paymentStatus: "Mock held", status: "confirmed", createdAt: "2026-10-17T10:00:00.000Z", updatedAt: "2026-10-18T10:00:00.000Z" },
  { id: "SW-24016", carId: "car-mercedes-s", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-24", endDate: "2026-10-26", days: 2, pricePerDay: 220, subtotal: 440, serviceFee: 35, total: 475, paymentStatus: "Mock held", status: "disputed", createdAt: "2026-10-14T10:00:00.000Z", updatedAt: "2026-10-24T08:00:00.000Z" },
  { id: "SW-24015", carId: "car-bmw-5", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-24", endDate: "2026-10-26", days: 2, pricePerDay: 165, subtotal: 330, serviceFee: 35, total: 365, paymentStatus: "Mock held", status: "in_progress", createdAt: "2026-10-14T10:00:00.000Z", updatedAt: "2026-10-24T08:00:00.000Z" },
  { id: "SW-24011", carId: "car-audi-r8", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-18", endDate: "2026-10-20", days: 2, pricePerDay: 285, subtotal: 570, serviceFee: 35, total: 605, paymentStatus: "Mock paid", status: "reviewed", createdAt: "2026-10-10T10:00:00.000Z", updatedAt: "2026-10-21T09:00:00.000Z" },
  { id: "SW-24008", carId: "car-range-rover", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-02", endDate: "2026-10-04", days: 2, pricePerDay: 190, subtotal: 380, serviceFee: 35, total: 415, paymentStatus: "Mock paid", status: "completed", createdAt: "2026-09-28T10:00:00.000Z", updatedAt: "2026-10-04T10:00:00.000Z" },
  { id: "SW-24009", carId: "car-range-rover", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-10-12", endDate: "2026-10-14", days: 2, pricePerDay: 190, subtotal: 380, serviceFee: 35, total: 415, paymentStatus: "Mock refunded", status: "cancelled", createdAt: "2026-10-05T10:00:00.000Z", updatedAt: "2026-10-07T10:00:00.000Z" },
  { id: "SW-24007", carId: "car-mercedes-s", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, startDate: "2026-09-05", endDate: "2026-09-07", days: 2, pricePerDay: 220, subtotal: 440, serviceFee: 35, total: 475, paymentStatus: "Mock unpaid", status: "declined", createdAt: "2026-09-01T10:00:00.000Z", updatedAt: "2026-09-02T10:00:00.000Z" },
];

const demoReviews = [{ id: "review-demo-01", bookingId: "SW-24011", carId: "car-audi-r8", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, renter: DEMO_RENTER.name, car: "Audi R8 V10", rating: 5, comment: "A seamless pickup and a beautiful drive.", ownerReply: "Thank you for taking such good care of the car.", createdAt: "2026-10-21T09:00:00.000Z" }];
const demoDisputes = [{ id: "DSP-024", bookingId: "SW-24016", carId: "car-mercedes-s", renterId: DEMO_RENTER.id, ownerId: DEMO_OWNER.id, reason: "Vehicle condition", description: "Fuel level at return differed from the pickup record.", status: "open", resolutionNotes: "", resolvedBy: null, createdAt: "2026-10-24T09:00:00.000Z", resolvedAt: null }];
const demoAnnouncements = [{ id: "announcement-demo-01", title: "Welcome to the Sheggar Wheels demo", message: "Browse the sample fleet and explore renter and owner workflows.", active: true, status: "Published", createdAt: "2026-10-01T09:00:00.000Z", createdBy: DEMO_ADMIN.id }];

const navGroups = {
  renter: [
    ["Overview", "/dashboard"],
    ["Find a car", "/cars"],
    ["My bookings", "/bookings"],
  ],
  owner: [
    ["Overview", "/owner"],
    ["My cars", "/owner/cars"],
    ["Bookings", "/owner/cars"],
    ["Earnings", "/owner/earnings"],
    ["Reviews", "/owner/reviews"],
    ["Disputes", "/owner/disputes"],
  ],
  admin: [
    ["Overview", "/admin"],
    ["Listings", "/admin/listings"],
    ["Users", "/admin/users"],
    ["Bookings", "/admin/bookings"],
    ["Disputes", "/admin/disputes"],
    ["Reports", "/admin/reports"],
    ["Announcements", "/admin/announcements"],
  ],
};

const routeInfo = {
  "/signin": ["Welcome back", "Sign in to manage your bookings and discover your next drive."],
  "/signup": ["Create your account", "Join Sheggar Wheels and get closer to your next great drive."],
  "/cars": ["Find your next drive", "Explore a curated fleet of exceptional cars."],
  "/cars/[id]": ["Vehicle details", "Everything you need to know before you book."],
  "/dashboard": ["Your dashboard", "Your upcoming drives and recent activity, all in one place."],
  "/bookings": ["Your bookings", "Keep track of upcoming and past rentals."],
  "/bookings/[id]": ["Booking details", "Your reservation summary and next steps."],
  "/bookings/[id]/track": ["Your trip", "Follow your pickup and trip status."],
  "/bookings/[id]/review": ["Share your experience", "Help the community choose with confidence."],
  "/checkout": ["Review your booking", "Confirm your trip details before continuing."],
  "/owner": ["Owner overview", "A quick view of your fleet and rental performance."],
  "/owner/cars": ["Your fleet", "Manage the vehicles you share with the community."],
  "/owner/cars/new": ["Add a vehicle", "Create a listing for your next renter."],
  "/owner/cars/[id]/edit": ["Edit vehicle", "Keep your listing details up to date."],
  "/owner/cars/[id]/availability": ["Manage availability", "Choose when this vehicle is ready to rent."],
  "/owner/cars/[id]/bookings": ["Vehicle bookings", "Review reservations for this vehicle."],
  "/owner/earnings": ["Earnings", "Track your rental income and payouts."],
  "/owner/reviews": ["Renter reviews", "Read feedback and respond to your community."],
  "/owner/disputes": ["Disputes", "Review questions and resolution progress."],
  "/admin": ["Platform overview", "Monitor marketplace activity and platform health."],
  "/admin/listings": ["Listing moderation", "Review vehicles waiting for approval."],
  "/admin/users": ["User directory", "Manage renter and owner demo accounts."],
  "/admin/users/[id]": ["User account", "Review account status and activity."],
  "/admin/bookings": ["All bookings", "Search reservations across the marketplace."],
  "/admin/disputes": ["Dispute center", "Track and resolve rental issues."],
  "/admin/disputes/[id]": ["Dispute review", "Record a clear resolution for this case."],
  "/admin/reports": ["Platform reports", "Review marketplace performance at a glance."],
  "/admin/announcements": ["Announcements", "Share an update with the Sheggar Wheels community."],
};

const storeMethods = {
  users: [readUsers, writeUsers],
  cars: [readCars, writeCars],
  bookings: [readBookings, writeBookings],
  reviews: [readReviews, writeReviews],
  disputes: [readDisputes, writeDisputes],
  announcements: [readAnnouncements, writeAnnouncements],
};

const fallbackRows = { cars: demoCars, bookings: demoBookings, users: [], reviews: [], disputes: [], announcements: [] };
const cn = (...values) => values.filter(Boolean).join(" ");
const makeId = (prefix) => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`}`;
const isoNow = () => new Date().toISOString();

function normalizeRoles(user) {
  const source = user?.roles || (user?.role ? [user.role] : []);
  const roles = source.map((role) => String(role).toLowerCase());
  if (roles.includes("owner") && !roles.includes("renter")) roles.push("renter");
  return [...new Set(roles)];
}

function safeInternalDestination(value, roles = []) {
  const fallback = roles.includes("admin") ? "/admin" : roles.includes("owner") ? "/owner" : "/dashboard";
  if (typeof window === "undefined") return fallback;
  try {
    const safePath = safeReturnPath(value);
    const target = new URL(safePath, window.location.origin);
    if (safePath === "/" && value !== "/") return "/";
    if (target.pathname.startsWith("/admin") && !roles.includes("admin")) return fallback;
    if (target.pathname.startsWith("/owner") && !roles.includes("owner")) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

function downloadCsv(filename, rows) {
  if (typeof window === "undefined" || !rows.length) return;
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [columns.map(escape).join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ButtonLink({ href, children, secondary = false }) {
  return (
    <Link href={href} className={cn("inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition", secondary ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-slate-950 text-white hover:bg-orange-600")}>
      {children}
    </Link>
  );
}

function Metric({ label, value, note, icon = "↗" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between text-sm text-slate-500"><span>{label}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-lg text-orange-600">{icon}</span></div>
      <div className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
      {note && <div className="mt-1 text-sm text-slate-500">{note}</div>}
    </div>
  );
}

function Status({ children }) {
  const status = String(children || "pending");
  const style = /active|available|confirmed|approved|completed|reviewed|resolved|published|in_progress/i.test(status)
    ? "bg-emerald-50 text-emerald-700"
    : /reject|cancel|suspend|urgent|open/i.test(status)
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", style)}>{displayStatus(status)}</span>;
}

function Panel({ title, action, children, className }) {
  return (
    <section className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {(title || action) && <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><h2 className="font-semibold text-slate-900">{title}</h2>{action}</div>}
      <div className="p-5">{children}</div>
    </section>
  );
}

function DataTable({ columns, rows, empty = "Nothing here yet." }) {
  if (!rows.length) return <p className="py-7 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">{columns.map((column) => <th className="px-3 py-3 font-semibold" key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr className="border-b border-slate-50 last:border-0" key={row.id || row.email || index}>{columns.map((column) => <td className="px-3 py-4 text-slate-700" key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key] || "—"}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function Field({ label, name, type = "text", required = false, placeholder, defaultValue, options, min }) {
  const base = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {options ? <select className={base} name={name} defaultValue={defaultValue || options[0]?.value} required={required}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : type === "textarea" ? <textarea className={cn(base, "min-h-28 resize-y")} name={name} placeholder={placeholder} required={required} defaultValue={defaultValue} /> : <input className={base} name={name} type={type} placeholder={placeholder} required={required} defaultValue={defaultValue} min={min} />}
    </label>
  );
}

function FormCard({ title, description, fields, onSubmit, submitLabel = "Save changes", message, children }) {
  return (
    <Panel title={title}>
      {description && <p className="mb-5 text-sm leading-6 text-slate-500">{description}</p>}
      <form action={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">{fields?.map((field) => <div className={field.full ? "sm:col-span-2" : ""} key={field.name}><Field {...field} /></div>)}</div>
        {children}
        {message && <p role="status" className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-800">{message}</p>}
        <button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500" type="submit">{submitLabel}</button>
      </form>
    </Panel>
  );
}

function CarCard({ car }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("relative flex h-44 items-end justify-between overflow-hidden bg-gradient-to-br to-slate-200 p-5", car.accent || "from-orange-400/30")}>
        {car.photos?.[0] && <img src={car.photos[0]} alt={car.name} className="absolute inset-0 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        <div className="absolute -right-8 -bottom-10 h-40 w-64 -rotate-6 rounded-[50%] border-[18px] border-slate-900/80 bg-slate-700 shadow-xl"><span className="absolute -left-5 bottom-1 h-10 w-10 rounded-full border-8 border-slate-950 bg-slate-300"/><span className="absolute right-2 bottom-1 h-10 w-10 rounded-full border-8 border-slate-950 bg-slate-300"/></div>
        <span className="relative z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">{car.category || "Premium"}</span>
        <span className="relative z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">★ 4.9</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{car.name || "Premium vehicle"}</h3><p className="mt-1 text-xs text-slate-500">{car.location || "Addis Ababa"}</p></div><p className="shrink-0 text-right"><strong className="text-lg text-slate-950">${car.price || 150}</strong><span className="block text-xs text-slate-500">per day</span></p></div>
        <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{car.seats || 5} seats</span><span>{car.transmission || "Automatic"}</span><span>{car.fuel || "Premium"}</span></div>
        <ButtonLink href={`/cars/${car.id || "car-audi-r8"}`}>View vehicle</ButtonLink>
      </div>
    </article>
  );
}

export default function DemoPage({ routeKey, recordId }) {
  const router = useRouter();
  const [records, setRecords] = useState(fallbackRows);
  const [session, setSession] = useState({ userId: null, metadata: {} });
  const [authReady, setAuthReady] = useState(false);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [draft, setDraft] = useState({ selectedDates: null, summary: null });
  const [returnTo, setReturnTo] = useState("");

  useEffect(() => {
    const loaded = {};
    for (const [name, [reader]] of Object.entries(storeMethods)) loaded[name] = reader().data;
    const seedUsers = [DEMO_OWNER, DEMO_RENTER, DEMO_ADMIN];
    loaded.users = seedUsers.map((seed) => loaded.users.find((user) => user.id === seed.id || user.email?.toLowerCase() === seed.email) || seed)
      .concat(loaded.users.filter((user) => !seedUsers.some((seed) => user.id === seed.id || user.email?.toLowerCase() === seed.email)));
    for (const [name, seeds] of Object.entries({ cars: demoCars, bookings: demoBookings, reviews: demoReviews, disputes: demoDisputes, announcements: demoAnnouncements })) {
      const existing = new Map((loaded[name] || []).map((record) => [record.id, record]));
      for (const seed of seeds) if (!existing.has(seed.id)) existing.set(seed.id, seed);
      loaded[name] = [...existing.values()];
    }
    loaded.cars = loaded.cars.map((car) => ({ ...car, pricePerDay: Number(car.pricePerDay ?? car.price ?? 0), photos: Array.isArray(car.photos) ? car.photos : [], unavailableDates: Array.isArray(car.unavailableDates) ? car.unavailableDates : [], createdAt: car.createdAt || isoNow() }));
    loaded.bookings = loaded.bookings.map((booking) => {
      const car = loaded.cars.find((item) => item.id === booking.carId);
      const renter = loaded.users.find((item) => item.id === booking.renterId);
      const days = Number(booking.days) || Math.max(1, Math.ceil((new Date(`${booking.endDate}T00:00:00Z`) - new Date(`${booking.startDate}T00:00:00Z`)) / 86400000)) || 1;
      const pricePerDay = Number(booking.pricePerDay ?? car?.pricePerDay ?? 0);
      const subtotal = Number(booking.subtotal ?? booking.total ?? pricePerDay * days);
      return { ...booking, status: normalizeBookingStatus(booking.status), car: booking.car || car?.name || "Vehicle", renter: booking.renter || renter?.name || "Demo renter", days, pricePerDay, subtotal, serviceFee: Number(booking.serviceFee ?? Math.max(0, Number(booking.total || 0) - subtotal)), total: Number(booking.total ?? subtotal + Number(booking.serviceFee || 0)), paymentStatus: booking.paymentStatus || "Mock unpaid", createdAt: booking.createdAt || isoNow(), updatedAt: booking.updatedAt || booking.createdAt || isoNow() };
    });
    const reviewedBookingIds = new Set(loaded.reviews.map((review) => review.bookingId).filter(Boolean));
    loaded.bookings = loaded.bookings.map((booking) => reviewedBookingIds.has(booking.id) && booking.status === "completed" ? { ...booking, status: "reviewed" } : booking);
    loaded.disputes = loaded.disputes.map((dispute) => ({ ...dispute, status: ({ "in review": "open", "in_review": "open" })[String(dispute.status || "open").toLowerCase()] || String(dispute.status || "open").toLowerCase(), resolutionNotes: dispute.resolutionNotes || dispute.notes || "", resolvedBy: dispute.resolvedBy || null, resolvedAt: dispute.resolvedAt || null, createdAt: dispute.createdAt || isoNow() }));
    const disputedBookingIds = new Set(loaded.disputes.filter((dispute) => dispute.status === "open").map((dispute) => dispute.bookingId));
    loaded.bookings = loaded.bookings.map((booking) => disputedBookingIds.has(booking.id) && booking.status === "in_progress" ? { ...booking, status: "disputed" } : booking);
    for (const name of Object.keys(storeMethods)) storeMethods[name][1](loaded[name]);
    setRecords((current) => ({ ...current, ...loaded }));
    const savedSession = getCurrentSession().session;
    setSession(savedSession);
    setDraft(readCheckoutDraft().data);
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (routeKey === "/signin" || routeKey === "/signup") {
      setReturnTo(new URLSearchParams(window.location.search).get("next") || "");
    }
  }, [routeKey]);

  const [title, description] = routeInfo[routeKey] || ["Sheggar Wheels", "Manage your rental experience."];
  const role = routeKey.startsWith("/admin") ? "admin" : routeKey.startsWith("/owner") ? "owner" : "renter";
  const nav = navGroups[role];
  const isPublicRoute = ["/", "/cars", "/cars/[id]", "/signin", "/signup"].includes(routeKey);
  const requiredRole = routeKey.startsWith("/admin") ? "admin" : routeKey.startsWith("/owner") ? "owner" : "renter";

  useEffect(() => {
    if (!authReady) return;
    const currentAuth = getCurrentSession();
    if (currentAuth.user && String(currentAuth.user.status).toLowerCase() === "suspended") return;
    if (isPublicRoute) return;
    if (!session.userId || !currentAuth.user) {
      const next = `${window.location.pathname}${window.location.search}`;
      setAuthRedirecting(true);
      router.replace(`/signin?next=${encodeURIComponent(next)}`);
      return;
    }
    const roles = normalizeRoles(currentAuth.user);
    if (["/bookings/[id]", "/bookings/[id]/track", "/bookings/[id]/review"].includes(routeKey)) {
      const booking = (records.bookings || []).find((item) => item.id === recordId && item.renterId === session.userId);
      const alreadyReviewed = records.reviews?.some((review) => review.bookingId === recordId);
      if (!booking || (routeKey.endsWith("/review") && (normalizeBookingStatus(booking.status) !== "completed" || alreadyReviewed))) {
        setAccessError(routeKey.endsWith("/review") ? alreadyReviewed ? "You have already reviewed this booking." : "A completed booking on your account is required to leave a review." : "This booking is not available in your renter account.");
        return;
      }
    }
    if (routeKey.startsWith("/owner/cars/[id]/") && !records.cars?.some((car) => car.id === recordId && car.ownerId === session.userId)) {
      setAccessError("This vehicle is not attached to your owner account.");
      return;
    }
    if (!roles.includes(requiredRole)) {
      setAccessError(requiredRole === "owner"
        ? "This account does not have owner capabilities yet. Enable owner mode to manage a fleet."
        : requiredRole === "admin"
          ? "Admin pages are available only through the seeded demo admin account."
          : "Sign in with a renter account to view this page.");
      return;
    }
    setAccessError("");
  }, [authReady, isPublicRoute, recordId, records.bookings, records.cars, records.reviews, records.users, requiredRole, routeKey, router, session]);
  const allCars = records.cars || demoCars;
  const allBookings = records.bookings || demoBookings;
  const ownedCars = (records.cars || []).filter((car) => car.ownerId === session.userId);
  const ownedCarIds = new Set(ownedCars.map((car) => car.id));
  const renterBookings = allBookings.filter((booking) => booking.renterId === session.userId);
  const ownerBookings = allBookings.filter((booking) => ownedCarIds.has(booking.carId));
  const visibleCars = useMemo(() => allCars.filter((car) => {
    const matchesSearch = `${car.name} ${car.location} ${car.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || car.category?.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter && ["approved", "active"].includes(String(car.status || "").toLowerCase());
  }).sort((a, b) => sort === "Price: low to high" ? Number(a.price) - Number(b.price) : sort === "Price: high to low" ? Number(b.price) - Number(a.price) : 0), [allCars, search, filter, sort]);

  function deny(message) { setMessage(message); return false; }

  function saveRecord(kind, record, { prepend = true } = {}) {
    const current = getCurrentSession();
    if (!current.session.userId || !current.user) return deny("Not signed in.");
    if (String(current.user.status).toLowerCase() === "suspended") return deny("This demo account is suspended. No actions are available.");
    const roles = normalizeRoles(current.user);
    const existing = storeMethods[kind]?.[0]().data || [];
    const protectedByRole = {
      bookings: "renter", cars: "owner", reviews: "renter", announcements: "admin",
    }[kind];
    if (kind === "disputes") {
      const related = (readBookings().data || []).find((item) => item.id === record.bookingId);
      if (!roles.includes("renter") && !roles.includes("owner")) return deny("This action requires the renter or owner role.");
      if (!related || ![related.renterId, related.ownerId].includes(current.session.userId)) return deny("Not yours.");
      if (related.status !== "in_progress") return deny("This booking is not in a state that allows an issue report.");
    } else {
      const access = requireRole(protectedByRole);
      if (!access.ok) return deny(access.message);
    }
    if (kind === "bookings" && record.renterId !== current.session.userId) return deny("Not yours.");
    if (kind === "cars" && record.ownerId !== current.session.userId) return deny("Not yours.");
    if (kind === "reviews") {
      const booking = (readBookings().data || []).find((item) => item.id === record.bookingId);
      if (!booking || booking.renterId !== current.session.userId) return deny("Not yours.");
      if (booking.status !== "completed" || existing.some((item) => item.bookingId === booking.id)) return deny("This booking is not eligible for a review.");
    }
    if (kind === "users" || !storeMethods[kind]) return deny("This action is not available.");
    const next = records[kind] || [];
    const result = storeMethods[kind][1](prepend ? [record, ...next] : [...next, record]);
    if (!result.ok) {
      setMessage(result.message);
      return false;
    }
    setRecords((current) => ({ ...current, [kind]: prepend ? [record, ...(current[kind] || [])] : [...(current[kind] || []), record] }));
    setMessage("Saved in this browser for your demo session.");
    return true;
  }

  function updateCarStatus(id, status, sourceRows) {
    const auth = getCurrentSession();
    if (!auth.session.userId || !auth.user) return deny("Not signed in.");
    if (String(auth.user.status).toLowerCase() === "suspended") return deny("This demo account is suspended. No actions are available.");
    const current = readCars().data;
    const car = current.find((item) => item.id === id);
    if (!car) return deny("This vehicle is no longer available.");
    if (car.ownerId === auth.session.userId) {
      const access = requireRole("owner"); if (!access.ok) return deny(access.message);
    } else {
      const access = requireRole("admin"); if (!access.ok) return deny("Not yours.");
    }
    const updated = current.map((car) => car.id === id ? { ...car, status, updatedAt: isoNow() } : car);
    const result = writeCars(updated);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setRecords((value) => ({ ...value, cars: updated }));
    setMessage(`Listing ${status.toLowerCase()}.`);
  }

  function updateCollectionRecord(kind, id, updates, sourceRows = []) {
    const auth = getCurrentSession();
    if (!auth.session.userId || !auth.user) return deny("Not signed in.");
    if (String(auth.user.status).toLowerCase() === "suspended") return deny("This demo account is suspended. No actions are available.");
    const current = storeMethods[kind]?.[0]().data || [];
    const target = current.find((record) => record.id === id);
    if (!target) return deny("This record is no longer available.");
    const isAdmin = normalizeRoles(auth.user).includes("admin");
    let roleToRequire;
    if (kind === "cars") roleToRequire = target.ownerId === auth.session.userId ? "owner" : "admin";
    else if (kind === "bookings") roleToRequire = target.renterId === auth.session.userId ? "renter" : target.ownerId === auth.session.userId ? "owner" : "admin";
    else if (kind === "reviews" || kind === "disputes") roleToRequire = target.ownerId === auth.session.userId ? "owner" : kind === "disputes" && isAdmin ? "admin" : "renter";
    else roleToRequire = "admin";
    const access = requireRole(roleToRequire);
    if (!access.ok) return deny(access.message);
    if (kind === "cars" && !isAdmin && target.ownerId !== auth.session.userId) return deny("Not yours.");
    if (kind === "bookings") {
      const car = readCars().data.find((item) => item.id === target.carId);
      const ownsAsRenter = roleToRequire === "renter" && target.renterId === auth.session.userId;
      const ownsAsCarOwner = roleToRequire === "owner" && (target.ownerId === auth.session.userId || car?.ownerId === auth.session.userId);
      if (!ownsAsRenter && !ownsAsCarOwner && !isAdmin) return deny("Not yours.");
      if (updates.status) {
        if (!bookingTransitions[target.status]?.includes(updates.status)) return deny(`The booking cannot move from ${displayStatus(target.status)} to ${displayStatus(updates.status)}.`);
        const ownerActions = ["confirmed", "declined", "completed"].includes(updates.status);
        const renterActions = ["cancelled", "in_progress", "reviewed"].includes(updates.status);
        if (updates.status === "disputed" && !["renter", "owner", "admin"].includes(roleToRequire)) return deny("This role cannot perform that booking action.");
        if ((ownerActions && roleToRequire !== "owner" && !isAdmin) || (renterActions && roleToRequire !== "renter" && !isAdmin) || (updates.status === "resolved" && !isAdmin)) return deny("This role cannot perform that booking action.");
      }
    }
    if (kind === "reviews" && (target.ownerId !== auth.session.userId || !target.bookingId)) return deny("Not yours.");
    if (kind === "disputes") {
      if (roleToRequire === "owner" && target.ownerId !== auth.session.userId) return deny("Not yours.");
      if (updates.status === "resolved" && !isAdmin) return deny("This action requires the admin role.");
      if (roleToRequire !== "admin" && target.ownerId !== auth.session.userId) return deny("Not yours.");
    }
    if (kind === "users" && target.id === auth.session.userId) return deny("You cannot change your own account status.");
    const combined = new Map(current.map((record) => [record.id, record]));
    const updated = current.map((record) => record.id === id ? { ...record, ...updates, updatedAt: isoNow() } : record);
    const result = storeMethods[kind][1](updated);
    if (!result.ok) {
      setMessage(result.message);
      return false;
    }
    setRecords((value) => ({ ...value, [kind]: updated }));
    setMessage("Changes saved in this browser.");
    return true;
  }

  function transitionBooking(id, nextStatus, sourceRows = []) {
    const booking = allBookings.find((item) => item.id === id);
    if (!booking || !bookingTransitions[booking.status]?.includes(nextStatus)) {
      setMessage(`The booking cannot move from ${displayStatus(booking?.status || "unknown")} to ${displayStatus(nextStatus)}.`);
      return false;
    }
    return updateCollectionRecord("bookings", id, {
      status: nextStatus,
      ...(nextStatus === "confirmed" ? { paymentStatus: "Mock held" } : {}),
    }, sourceRows);
  }

  function approveBooking(id, sourceRows) {
    const booking = allBookings.find((item) => item.id === id);
    if (!booking) return;
    if (booking.status !== "requested") return transitionBooking(id, "confirmed", sourceRows);
    const conflict = allBookings.some((item) => item.id !== id && item.carId === booking.carId && !["cancelled", "declined", "completed", "reviewed", "resolved"].includes(item.status) && booking.startDate < item.endDate && booking.endDate > item.startDate);
    if (conflict) {
      setMessage("These dates overlap another active booking for this vehicle.");
      return;
    }
    transitionBooking(id, "confirmed", sourceRows);
  }

  function raiseBookingIssue(id, sourceRows = []) {
    const booking = allBookings.find((item) => item.id === id);
    if (!booking || booking.status !== "in_progress") return;
    const now = isoNow();
    if (!saveRecord("disputes", { id: makeId("dispute"), bookingId: booking.id, carId: booking.carId, renterId: booking.renterId, ownerId: booking.ownerId, reason: "Rental issue", description: "An issue was reported during the simulated rental.", status: "open", resolutionNotes: "", resolvedBy: null, createdAt: now, resolvedAt: null })) return;
    transitionBooking(id, "disputed", sourceRows);
  }

  function formAction(handler) {
    return (formData) => handler(Object.fromEntries(formData.entries()));
  }

  const userRows = records.users?.length ? records.users : [{ id: "demo-owner", name: "Maya Bekele", email: "maya@example.com", role: "Owner", status: "Active" }, { id: "demo-renter", name: "Daniel Tesfaye", email: "daniel@example.com", role: "Renter", status: "Active" }];
  const accountSuspended = authReady && String(userRows.find((user) => user.id === session.userId)?.status).toLowerCase() === "suspended";
  const reviewRows = records.reviews || [];
  const ownerReviewRows = reviewRows.filter((review) => ownedCarIds.has(review.carId) || review.ownerId === session.userId);
  const disputeRows = records.disputes || [];
  const ownerDisputeRows = disputeRows.filter((dispute) => ownedCarIds.has(dispute.carId) || dispute.ownerId === session.userId);
  const announcementRows = records.announcements || [];

  function renderContent() {
    if (routeKey === "/cars") {
      return <>
        <div className="mb-5 rounded-2xl bg-slate-950 p-4 sm:p-5"><div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]"><label className="text-xs font-medium text-slate-300">Where<input value={search} onChange={(event) => setSearch(event.target.value)} className="mt-1.5 w-full rounded-xl border border-white/10 bg-white px-3 py-3 text-sm text-slate-900" placeholder="City, airport, or car"/></label><Field label="Pick-up" name="pickup" type="date"/><Field label="Return" name="return" type="date"/><button className="self-end rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400" onClick={() => setMessage("Showing cars available for your search.")}>Search cars</button></div></div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">{visibleCars.length} exceptional vehicles</p><div className="flex gap-2"><select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option><option>Exotic</option><option>Luxury</option><option>Premium SUV</option></select><select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Price: low to high</option><option>Price: high to low</option></select></div></div>
        {message && <p className="mb-4 text-sm text-emerald-700">{message}</p>}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleCars.map((car) => <CarCard car={car} key={car.id}/>)}</div>
      </>;
    }

    if (routeKey === "/cars/[id]") {
      const car = allCars.find((item) => item.id === recordId && item.status === "Approved") || demoCars[0];
      return <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]"><div className="space-y-5"><div className="relative flex h-72 items-end overflow-hidden rounded-3xl bg-gradient-to-br from-orange-200 via-slate-300 to-slate-700 p-7">{car.photos?.[0]&&<img src={car.photos[0]} alt={car.name} className="absolute inset-0 h-full w-full object-cover" onError={(event)=>{event.currentTarget.style.display="none";}}/>}<span className="relative rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">{car.category}</span></div><Panel title="About this vehicle"><p className="leading-7 text-slate-600">{car.description || `Enjoy a carefully maintained ${car.name} with a smooth drive, flexible pickup, and attentive local support.`}</p><div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm"><div className="rounded-xl bg-slate-50 p-3"><strong>{car.seats || 2}</strong><span className="mt-1 block text-slate-500">Seats</span></div><div className="rounded-xl bg-slate-50 p-3"><strong>{car.transmission || "Auto"}</strong><span className="mt-1 block text-slate-500">Transmission</span></div><div className="rounded-xl bg-slate-50 p-3"><strong>4.9 ★</strong><span className="mt-1 block text-slate-500">Rating</span></div></div></Panel><Panel title="Pickup location"><p className="text-sm text-slate-600">{car.location}</p><p className="mt-2 text-xs text-slate-400">Exact pickup instructions are shared after the booking is confirmed.</p></Panel></div><Panel title="Reserve this car"><div className="mb-4"><strong className="text-3xl">${car.price}</strong><span className="text-slate-500"> / day</span></div><form action={(formData) => { const values = Object.fromEntries(formData.entries()); const checkout = { selectedDates: { startDate: values.startDate, endDate: values.endDate }, summary: { carId: car.id, ownerId: car.ownerId, car: car.name, price: car.price } }; const result = writeCheckoutDraft(checkout); if (!result.ok) { setMessage(result.message); return; } setDraft(checkout); router.push("/checkout"); }} className="space-y-4"><Field label="Pick-up date" name="startDate" type="date" required/><Field label="Return date" name="endDate" type="date" required/><p className="text-xs leading-5 text-slate-500">No payment details are collected in this demo.</p>{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<button className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-400">Continue to checkout</button></form></Panel></div>;
    }

    if (routeKey === "/signin" || routeKey === "/signup") {
      const isSignup = routeKey === "/signup";
      const nextFromUrl = () => new URLSearchParams(window.location.search).get("next");
      const enterAdmin = () => {
        const result = signInAsDemo(DEMO_ADMIN.id);
        if (!result.ok) { setMessage(result.message); return; }
        const adminSession = getCurrentSession().session;
        setSession(adminSession);
        router.replace(safeInternalDestination(nextFromUrl(), ["admin"]));
      };
      return <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"><div className="hidden flex-col justify-between bg-slate-950 p-8 text-white md:flex"><span className="text-sm font-semibold tracking-[0.18em]">SHEGGAR WHEELS</span><div><p className="text-3xl font-semibold leading-tight">Your next great drive starts here.</p><p className="mt-3 text-sm leading-6 text-slate-300">A more personal way to discover and book premium cars.</p></div><span className="text-xs text-slate-400">Private fleet · Personal service</span></div><div className="p-6 sm:p-9"><h2 className="text-2xl font-semibold text-slate-950">{isSignup ? "Create your account" : "Welcome back"}</h2><p className="mt-2 text-sm text-slate-500">{isSignup ? "Set up a demo account in seconds." : "Sign in to continue to your dashboard."}</p><form action={formAction((values) => { const email = values.email.trim().toLowerCase(); let users = records.users || []; if (isSignup && email === DEMO_ADMIN.email) { setMessage("That email is reserved for the seeded demo admin account."); return; } let user = users.find((item) => item.email?.toLowerCase() === email); if (!user && isSignup) { const roles = values.capability === "renter-owner" ? ["renter", "owner"] : ["renter"]; user = { id: makeId("user"), name: values.name, email, phone: values.phone || "", roles, status: "Active", createdAt: isoNow() }; const result = writeUsers([user, ...users]); if (!result.ok) { setMessage(result.message); return; } users = [user, ...users]; setRecords((current) => ({ ...current, users })); } if (!user) { setMessage("No demo account was found for that email. Create an account to continue."); return; } if (user.status === "Suspended") { setMessage("This demo account is suspended. Contact an administrator to restore access."); return; } const roles = normalizeRoles(user); const result = signInAsDemo(user.id); if (!result.ok) { setMessage(result.message); return; } const sessionValue = getCurrentSession().session; setSession(sessionValue); router.replace(safeInternalDestination(nextFromUrl(), roles)); })} className="mt-6 space-y-4">{isSignup && <><Field label="Full name" name="name" required placeholder="Your name"/><Field label="Phone (optional)" name="phone" type="tel" placeholder="+251 …"/><Field label="Account capabilities" name="capability" options={[{label:"Renter",value:"renter"},{label:"Renter + owner",value:"renter-owner"}]}/></>}<Field label="Email address" name="email" type="email" required placeholder="you@example.com"/><Field label="Password" name="password" type="password" required placeholder="Enter any demo password"/><p className="text-xs leading-5 text-slate-500">Demo only. Passwords are never saved; sign-in matches an account by email.</p>{message && <p role="status" className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">{message}</p>}<button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-orange-600">{isSignup ? "Create account" : "Sign in"}</button></form>{!isSignup && <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-orange-800">Seeded demo administrator</p><p className="mt-1 text-sm text-slate-700">{DEMO_ADMIN.email}</p><button type="button" onClick={enterAdmin} className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-500">Continue as demo admin</button><p className="mt-2 text-[11px] leading-4 text-slate-500">Front-end demo access only. No password is stored or checked.</p></div>}{!isSignup && <div className="mt-3 rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Seeded renter demo</p><p className="mt-1 text-sm text-slate-700">{DEMO_RENTER.email}</p><p className="text-xs text-slate-500">Use the demo sign-in form to open this account.</p></div>}{!isSignup && <div className="mt-3 rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Seeded owner demo</p><p className="mt-1 text-sm text-slate-700">{DEMO_OWNER.email}</p><p className="text-xs text-slate-500">Includes multiple sample vehicles and booking activity.</p></div>}<p className="mt-5 text-center text-sm text-slate-500">{isSignup ? "Already have an account?" : "New to Sheggar Wheels?"} <Link className="font-semibold text-orange-600" href={`${isSignup?"/signin":"/signup"}${returnTo?`?next=${encodeURIComponent(returnTo)}`:""}`}>{isSignup ? "Sign in" : "Create account"}</Link></p></div></div>;
    }

    if (routeKey === "/dashboard" || routeKey === "/owner" || routeKey === "/admin") {
      const admin = routeKey === "/admin";
      const owner = routeKey === "/owner";
      const activityRows = admin ? allBookings : owner ? ownerBookings : renterBookings;
      const viewAllHref = admin ? "/admin/bookings" : owner ? (ownedCars[0] ? `/owner/cars/${ownedCars[0].id}/bookings` : "/owner/cars") : "/bookings";
      return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label={admin ? "Gross bookings" : owner ? "This month" : "Upcoming trips"} value={admin ? "$48.2k" : owner ? "$4,820" : String(renterBookings.length)} note={admin ? "+12.8% over last month" : owner ? "+8.2% from last month" : "Your trips"}/><Metric label={admin ? "Active users" : owner ? "Active vehicles" : "Completed trips"} value={admin ? "1,284" : owner ? String(ownedCars.length) : String(renterBookings.filter((booking) => ["completed", "reviewed"].includes(booking.status)).length)} note="Updated just now" icon="◎"/><Metric label={admin ? "Pending listings" : owner ? "Utilization" : "Saved cars"} value={admin ? "12" : owner ? "76%" : "3"} note="Needs your attention" icon="◷"/><Metric label="Open items" value={admin ? "6" : owner ? "2" : "1"} note="Review when you have a moment" icon="!"/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]"><Panel title={admin ? "Marketplace activity" : owner ? "Recent bookings" : "Upcoming bookings"} action={<ButtonLink href={viewAllHref}>View all</ButtonLink>}><DataTable columns={[{key:"id",label:"Booking"},{key:"car",label:"Vehicle"},{key:"startDate",label:"Dates"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]} rows={activityRows.slice(0,3)}/></Panel><Panel title="Quick actions"><div className="space-y-3"><QuickAction href={admin?"/admin/listings":owner?"/owner/cars/new":"/cars"} title={admin?"Review new listings":owner?"Add a vehicle":"Find a car"} text={admin?"Keep the marketplace current.":owner?"Share another vehicle.":"Explore available premium vehicles."}/><QuickAction href={admin?"/admin/disputes":owner?"/owner/earnings":"/bookings"} title={admin?"Resolve open disputes":owner?"View earnings":"Manage bookings"} text="Go straight to the details that need you."/>{!admin&&!owner&&<div className="rounded-xl border border-orange-100 bg-orange-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-orange-700">Simulated trip alert</p><p className="mt-1 text-sm font-semibold text-slate-800">Pickup reminder · Oct 26, 9:00 AM</p><p className="mt-1 text-xs leading-5 text-slate-600">Your host will confirm the airport meeting point before pickup.</p></div>}</div></Panel></div></>;
    }

    if (["/bookings", "/owner/cars/[id]/bookings", "/admin/bookings"].includes(routeKey)) {
      const ownerRows = allBookings.filter((item) => item.carId === recordId && ownedCarIds.has(item.carId));
      const rows = routeKey === "/admin/bookings" ? allBookings : routeKey === "/owner/cars/[id]/bookings" ? ownerRows : renterBookings;
      return <Panel title="Reservation activity" action={<div className="flex gap-2"><select aria-label="Filter bookings" className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" value={filter} onChange={(event)=>setFilter(event.target.value)}><option value="All">All</option>{["requested", "confirmed", "in_progress", "completed", "reviewed", "declined", "cancelled", "disputed", "resolved"].map((status) => <option key={status} value={status}>{displayStatus(status)}</option>)}</select>{routeKey==="/bookings"&&<button onClick={()=>downloadCsv("my-bookings.csv",rows)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">Export CSV</button>}</div>}><DataTable columns={[{key:"id",label:"Booking ID"},{key:"car",label:"Vehicle"},{key:"renter",label:"Renter"},{key:"startDate",label:"Pick-up"},{key:"endDate",label:"Return"},{key:"total",label:"Total",render:(value)=><span>${value}</span>},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"Actions",render:(value,row)=>routeKey==="/owner/cars/[id]/bookings"&&row.status==="requested"?<div className="flex gap-2"><button onClick={()=>approveBooking(value,rows)} className="font-semibold text-emerald-700">Approve</button><button onClick={()=>transitionBooking(value,"declined",rows)} className="font-semibold text-rose-600">Decline</button></div>:routeKey==="/owner/cars/[id]/bookings"&&row.status==="in_progress"?<div className="flex gap-2"><button onClick={()=>transitionBooking(value,"completed",rows)} className="font-semibold text-emerald-700">Mark returned</button><button onClick={()=>raiseBookingIssue(value,rows)} className="font-semibold text-rose-600">Raise issue</button></div>:routeKey==="/owner/cars/[id]/bookings"?null:<div className="flex flex-wrap gap-3"><Link className="font-semibold text-orange-600 hover:underline" href={`/bookings/${value}`}>Details</Link>{routeKey==="/bookings"&&row.status==="completed"&&!records.reviews?.some((review)=>review.bookingId===value)&&<Link className="font-semibold text-orange-600 hover:underline" href={`/bookings/${value}/review`}>Review</Link>}{routeKey==="/bookings"&&row.status==="requested"&&<button onClick={()=>transitionBooking(value,"cancelled",rows)} className="font-semibold text-rose-600">Cancel request</button>}{routeKey==="/bookings"&&row.status==="confirmed"&&new Date(row.startDate)>new Date()&&<button onClick={()=>transitionBooking(value,"cancelled",rows)} className="font-semibold text-rose-600">Cancel</button>}{routeKey==="/bookings"&&row.status==="confirmed"&&new Date(row.startDate)<=new Date()&&<button onClick={()=>transitionBooking(value,"in_progress",rows)} className="font-semibold text-emerald-700">Start rental</button>}{routeKey==="/bookings"&&row.status==="in_progress"&&<><button onClick={()=>transitionBooking(value,"completed",rows)} className="font-semibold text-emerald-700">Mark returned</button><button onClick={()=>raiseBookingIssue(value,rows)} className="font-semibold text-rose-600">Raise issue</button></>}</div>}]} rows={rows.filter((item)=>filter==="All"||item.status===filter)}/></Panel>;
    }

    if (routeKey === "/bookings/[id]") {
      const booking = renterBookings.find((item) => item.id === recordId);
      if (!booking) return <Panel title="Booking not found"><p className="text-sm text-slate-600">This booking is not available in your renter account.</p><ButtonLink href="/bookings">Return to your bookings</ButtonLink></Panel>;
      return <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Reservation receipt"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking reference</p><p className="mt-1 text-lg font-semibold">{booking?.id || recordId}</p></div><Status>{booking?.status}</Status></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><Info label="Vehicle" value={booking?.car}/><Info label="Renter" value={booking?.renter}/><Info label="Pick-up" value={booking?.startDate}/><Info label="Return" value={booking?.endDate}/><Info label="Pick-up location" value="Bole International Airport"/><Info label="Total" value={`$${booking?.total || 0}`}/><Info label="Mock payment" value={booking?.paymentStatus}/></div><div className="mt-6 flex flex-wrap gap-3"><ButtonLink href={`/bookings/${booking?.id || recordId}/track`}>Track trip</ButtonLink>{booking?.status==="completed"&&!records.reviews?.some((review)=>review.bookingId===booking?.id)&&<ButtonLink href={`/bookings/${booking?.id || recordId}/review`} secondary>Leave a review</ButtonLink>}</div><p className="mt-5 text-xs text-slate-400">Demo receipt only. No payment was processed.</p></Panel><Panel title="Booking support"><p className="text-sm leading-6 text-slate-600">Keep this booking reference handy if you need help with pickup or your rental.</p><p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold">{booking?.id || recordId}</p></Panel></div>;
    }

    if (routeKey === "/checkout") {
      const checkout = draft?.summary || { car: "Audi R8 V10", price: 285 };
      const dates = draft?.selectedDates || { startDate: "2026-10-26", endDate: "2026-10-29" };
      return <div className="grid gap-5 xl:grid-cols-[1.3fr_0.8fr]"><div className="space-y-5"><Panel title="Trip details"><div className="grid gap-4 sm:grid-cols-2"><Info label="Vehicle" value={checkout.car || "Audi R8 V10"}/><Info label="Pick-up" value={dates.startDate || "Choose a date"}/><Info label="Return" value={dates.endDate || "Choose a date"}/><Info label="Pick-up location" value="Bole International Airport"/></div></Panel><Panel title="Pickup instructions"><p className="text-sm leading-6 text-slate-600">Your host will share the exact meeting point and contact details after the booking is confirmed.</p></Panel><Panel title="Payment"><p className="text-sm leading-6 text-slate-600">This is a demo checkout. No payment details are collected or processed.</p></Panel></div><Panel title="Price summary"><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Rental estimate</span><strong>${Number(checkout.price || 285) * 3}</strong></div><div className="flex justify-between"><span className="text-slate-500">Service fee</span><strong>$35</strong></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base"><span>Total</span><strong>${Number(checkout.price || 285) * 3 + 35}</strong></div></div><p className="my-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Mock payment review only. Payment credentials are never stored.</p><button onClick={()=>{const car=allCars.find((item)=>item.id===checkout.carId);const startDate=dates.startDate;const endDate=dates.endDate;const days=Math.max(1,Math.ceil((new Date(`${endDate}T00:00:00Z`)-new Date(`${startDate}T00:00:00Z`))/86400000));const overlap=allBookings.some((item)=>item.carId===checkout.carId&&!["cancelled","declined","completed","reviewed","resolved"].includes(item.status)&&startDate<item.endDate&&endDate>item.startDate);if(!car||!["Approved","Active"].includes(car.status)){setMessage("This vehicle is not currently approved for booking.");return;}if(!startDate||!endDate||endDate<=startDate){setMessage("Choose valid pick-up and return dates.");return;}if(overlap){setMessage("Those dates overlap an active booking for this vehicle. Choose different dates.");return;}const pricePerDay=Number(checkout.price||car.pricePerDay||car.price);const subtotal=pricePerDay*days;const now=isoNow();const ok=saveRecord("bookings",{id:makeId("SW"),carId:car.id,renterId:session.userId,ownerId:car.ownerId,startDate,endDate,days,pricePerDay,subtotal,serviceFee:35,total:subtotal+35,paymentStatus:"Mock unpaid",status:"requested",createdAt:now,updatedAt:now});if(ok)setMessage("Demo booking request saved. No payment was taken.");}} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-400">Request booking</button>{message && <div role="status" className="mt-3 text-sm text-emerald-700">{message}<Link href="/bookings" className="ml-2 font-semibold underline">View bookings</Link></div>}</Panel></div>;
    }

    if (routeKey === "/bookings/[id]/track") {
      const booking = renterBookings.find((item) => item.id === recordId);
      return <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Trip status"><div className="mb-4 flex items-center gap-3"><Status>{booking?.status}</Status><span className="text-sm text-slate-600">{booking?.car}</span></div><div className="rounded-2xl bg-gradient-to-br from-slate-100 to-emerald-50 p-6"><div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70"><div className="text-center"><span className="text-4xl">⌖</span><p className="mt-2 font-semibold text-slate-800">Pickup route preview</p><p className="mt-1 text-sm text-slate-500">Live location is simulated in this demo.</p></div></div></div></Panel><Panel title="Trip timeline"><Timeline items={[["Booking requested",booking?.status==="requested"?"Waiting for the owner’s decision.":"Request received."],["Booking confirmed",booking?.status==="confirmed"?"Your mock payment is held for this reservation.":"Reservation confirmation stage."],["Trip in progress",booking?.status==="in_progress"?"The rental is underway.":"Starts when the rental begins."],["Return and review",booking?.status==="completed"?"Trip complete. You can leave one review.":booking?.status==="reviewed"?"Trip complete and review submitted.":"Mark the vehicle returned after the trip."]]}/></Panel></div>;
    }

    if (routeKey === "/bookings/[id]/review") {
      const booking = renterBookings.find((item) => item.id === recordId);
      const car = allCars.find((item) => item.id === booking?.carId);
      return <FormCard title="Rate your rental" description="Your review helps future renters and supports great hosts." fields={[{label:"Overall rating",name:"rating",options:[{label:"★★★★★ Excellent",value:"5"},{label:"★★★★☆ Very good",value:"4"},{label:"★★★☆☆ Good",value:"3"},{label:"★★☆☆☆ Fair",value:"2"},{label:"★☆☆☆☆ Poor",value:"1"}]},{label:"Your review",name:"comment",type:"textarea",required:true,full:true,placeholder:"How was the car and pickup experience?"}]} message={message} submitLabel="Submit review" onSubmit={formAction((values)=>{const saved=saveRecord("reviews",{id:makeId("review"),bookingId:booking?.id,carId:booking?.carId,renterId:session.userId,ownerId:booking?.ownerId,renter:session.metadata?.name||"Demo renter",car:car?.name||booking?.car,rating:Number(values.rating),comment:values.comment,ownerReply:"",createdAt:isoNow()});if(saved&&transitionBooking(booking.id,"reviewed"))router.replace(`/bookings/${booking.id}`);})}/>;
    }

    if (routeKey === "/owner/cars" || routeKey === "/admin/listings") {
      const isModeration = routeKey === "/admin/listings";
      const rows = isModeration ? (records.cars?.length ? records.cars : demoCars.map((car)=>({...car,owner:"Demo owner",status:"Pending review"}))) : ownedCars;
      return <><Panel title={isModeration ? "Listings awaiting review" : "Your vehicles"} action={!isModeration ? <ButtonLink href="/owner/cars/new">+ Add a vehicle</ButtonLink> : null}><DataTable columns={[{key:"name",label:"Vehicle"},{key:"location",label:"Location"},{key:"category",label:"Category"},{key:"price",label:"Daily rate",render:(value)=><span>${value}/day</span>},{key:"status",label:"Status",render:(value)=><Status>{value||"Pending review"}</Status>},{key:"id",label:"Actions",render:(value,row)=>isModeration?<div className="flex gap-2"><button onClick={()=>updateCarStatus(value,"Approved",rows)} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Approve</button><button onClick={()=>updateCarStatus(value,"Rejected",rows)} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">Reject</button></div>:<div className="flex flex-wrap gap-3"><Link className="font-semibold text-orange-600" href={`/owner/cars/${value}/edit`}>Edit</Link><Link className="font-semibold text-slate-600" href={`/owner/cars/${value}/availability`}>Availability</Link><Link className="font-semibold text-slate-600" href={`/owner/cars/${value}/bookings`}>Bookings</Link><button onClick={()=>updateCarStatus(value,row.status==="Inactive"?"Approved":"Inactive",rows)} className="font-semibold text-rose-600">{row.status==="Inactive"?"Reactivate":"Deactivate"}</button></div>}]} rows={rows}/></Panel>{message&&<p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}</>;
    }

    if (["/owner/cars/new", "/owner/cars/[id]/edit"].includes(routeKey)) {
      const editing = routeKey.endsWith("edit");
      const car = allCars.find((item) => item.id === recordId) || {};
      const fields = [
        { label: "Vehicle name", name: "name", required: true, placeholder: "e.g. Audi R8 V10", defaultValue: car.name },
        { label: "Make", name: "make", required: true, placeholder: "e.g. Audi", defaultValue: car.make },
        { label: "Model", name: "model", required: true, placeholder: "e.g. R8 V10", defaultValue: car.model },
        { label: "Year", name: "year", type: "number", min: "1990", defaultValue: car.year || "2024" },
        { label: "Category", name: "category", defaultValue: car.category || "Luxury", options: [{ label: "Luxury", value: "Luxury" }, { label: "Exotic", value: "Exotic" }, { label: "Premium SUV", value: "Premium SUV" }, { label: "Sedan", value: "Sedan" }] },
        { label: "Daily rate (USD)", name: "price", type: "number", required: true, min: "1", placeholder: "150", defaultValue: car.price },
        { label: "Seats", name: "seats", type: "number", min: "1", defaultValue: car.seats || "5" },
        { label: "Transmission", name: "transmission", defaultValue: car.transmission || "Automatic", options: [{ label: "Automatic", value: "Automatic" }, { label: "Manual", value: "Manual" }] },
        { label: "Pickup location", name: "location", required: true, placeholder: "City or airport", defaultValue: car.location },
        { label: "Neighbourhood", name: "neighbourhood", placeholder: "e.g. Bole", defaultValue: car.neighbourhood },
        { label: "Latitude", name: "latitude", type: "number", defaultValue: car.latitude },
        { label: "Longitude", name: "longitude", type: "number", defaultValue: car.longitude },
        { label: "Demo photo", name: "photo", type: "file", full: true },
        { label: "Description", name: "description", type: "textarea", full: true, placeholder: "Describe the vehicle and pickup experience", defaultValue: car.description },
      ];
      return <FormCard title={editing ? "Update your vehicle" : "Vehicle details"} description="Share clear, accurate details to help renters choose confidently. Demo photos are represented by their filename." fields={fields} message={message} submitLabel={editing ? "Save vehicle changes" : "Save vehicle listing"} onSubmit={formAction((values) => {
        const { photo, ...details } = values;
        const changes = { ...details, photoName: photo?.name || car.photoName || "", price: Number(details.price), pricePerDay: Number(details.price), seats: Number(details.seats), year: Number(details.year), latitude: Number(details.latitude) || null, longitude: Number(details.longitude) || null, photos: car.photos?.length ? car.photos : ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80"], unavailableDates: car.unavailableDates || [], createdAt: car.createdAt || isoNow() };
        if (editing) updateCollectionRecord("cars", recordId, changes, allCars);
        else saveRecord("cars", { id: makeId("car"), ...changes, status: "Pending review", owner: session.metadata?.name || "Demo owner", ownerId: session.userId });
      })}/>;
    }

    if (routeKey === "/owner/cars/[id]/availability") return <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]"><FormCard title="Availability settings" description="Set the dates when renters can request this vehicle." fields={[{label:"Available from",name:"availableFrom",type:"date",required:true},{label:"Available until",name:"availableUntil",type:"date",required:true},{label:"Minimum rental (days)",name:"minimumDays",type:"number",min:"1",defaultValue:"1"},{label:"Notice period",name:"notice",options:[{label:"Same day",value:"0"},{label:"1 day",value:"1"},{label:"2 days",value:"2"},{label:"1 week",value:"7"}]}]} message={message} submitLabel="Save availability" onSubmit={formAction((values)=>updateCollectionRecord("cars",recordId,{availability:values},allCars))}/><Panel title="This month"><CalendarPreview/></Panel></div>;

    if (routeKey === "/owner/earnings") return <><div className="grid gap-4 sm:grid-cols-3"><Metric label="Gross earnings" value="$12,840" note="Year to date"/><Metric label="Available payout" value="$1,920" note="Ready for payout" icon="$"/><Metric label="Occupancy" value="76%" note="Across your fleet" icon="◷"/></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Monthly earnings" action={<button onClick={()=>downloadCsv("owner-earnings.csv",ownerBookings)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">Export CSV</button>}><EarningsChart/></Panel><Panel title="Recent payouts"><DataTable columns={[{key:"date",label:"Date"},{key:"reference",label:"Reference"},{key:"amount",label:"Amount"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]} rows={[{date:"Oct 18",reference:"PO-0818",amount:"$1,240",status:"Paid"},{date:"Oct 04",reference:"PO-0804",amount:"$980",status:"Paid"},{date:"Sep 20",reference:"PO-0920",amount:"$1,560",status:"Paid"}]}/></Panel></div></>;

    if (routeKey === "/owner/reviews") return <div className="grid gap-5 xl:grid-cols-[1.35fr_0.8fr]"><Panel title="Latest reviews" action={<span className="text-xs text-slate-500">Average 4.9 ★</span>}><DataTable columns={[{key:"renter",label:"Renter"},{key:"car",label:"Vehicle"},{key:"rating",label:"Rating"},{key:"comment",label:"Review"},{key:"ownerReply",label:"Your reply",render:(value)=><span className="text-slate-500">{value||"No reply yet"}</span>}]} rows={ownerReviewRows}/></Panel>{ownerReviewRows.length>0&&<FormCard title="Reply to a review" description="A thoughtful response helps build trust with future renters." fields={[{label:"Review",name:"reviewId",options:ownerReviewRows.map((review)=>({label:`${review.renter} · ${review.car}`,value:review.id}))},{label:"Your reply",name:"ownerReply",type:"textarea",required:true,full:true}]} message={message} submitLabel="Save reply" onSubmit={formAction((values)=>updateCollectionRecord("reviews",values.reviewId,{ownerReply:values.ownerReply},ownerReviewRows))}/>}</div>;

    if (routeKey === "/owner/disputes") return <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Disputes involving your rentals"><DataTable columns={[{key:"id",label:"Case"},{key:"bookingId",label:"Booking"},{key:"reason",label:"Issue"},{key:"createdAt",label:"Created"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]} rows={ownerDisputeRows}/></Panel>{ownerDisputeRows.some((dispute)=>dispute.status==="open")&&<FormCard title="Send a response" description="Add information related to the booking and case." fields={[{label:"Dispute",name:"disputeId",options:ownerDisputeRows.filter((item)=>item.status==="open").map((item)=>({label:`${item.id} · ${item.reason}`,value:item.id}))},{label:"Response",name:"ownerReply",type:"textarea",required:true,full:true}]} message={message} submitLabel="Submit response" onSubmit={formAction((values)=>updateCollectionRecord("disputes",values.disputeId,{ownerReply:values.ownerReply},ownerDisputeRows))}/>}</div>;

    if (["/admin/users", "/admin/disputes"].includes(routeKey)) {
      const users = routeKey === "/admin/users";
      const rows = users ? userRows : disputeRows;
      return <Panel title={users?"Marketplace accounts":"Open cases"}><DataTable columns={users?[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"roles",label:"Roles",render:(_,row)=><span>{normalizeRoles(row).join(" · ")||"—"}</span>},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"Actions",render:(value,row)=><div className="flex flex-wrap gap-3"><Link className="font-semibold text-orange-600" href={`/admin/users/${value}`}>View account</Link><button onClick={()=>updateCollectionRecord("users",value,{status:row.status==="Suspended"?"Active":"Suspended"},userRows)} className="font-semibold text-rose-600">{row.status==="Suspended"?"Reinstate":"Suspend"}</button></div>}]:[{key:"id",label:"Case"},{key:"bookingId",label:"Booking"},{key:"reason",label:"Issue"},{key:"createdAt",label:"Created"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"",render:(value)=><Link className="font-semibold text-orange-600" href={`/admin/disputes/${value}`}>Review</Link>}]} rows={rows}/></Panel>;
    }

    if (routeKey === "/admin/users/[id]") { const user=userRows.find((item)=>item.id===recordId)||userRows[0]; return <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Panel title="Account summary"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-semibold text-orange-700">{user?.name?.[0]||"U"}</div><div><h3 className="font-semibold text-slate-950">{user?.name}</h3><p className="text-sm text-slate-500">{user?.email}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><Info label="Roles" value={normalizeRoles(user).join(" · ")}/><Info label="Account status" value={user?.status}/><Info label="Member since" value="October 2026"/><Info label="Completed trips" value="4"/></div><button onClick={()=>updateCollectionRecord("users",user.id,{status:user.status==="Suspended"?"Active":"Suspended"},userRows)} className="mt-5 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">{user?.status==="Suspended"?"Reinstate account":"Suspend account"}</button>{message&&<p role="status" className="mt-3 text-sm text-slate-500">{message}</p>}</Panel><Panel title="Recent activity"><Timeline items={[["Account created","Demo profile is active."],["First booking","Reservation SW-24011 completed."],["Latest sign-in","Current browser session."]]}/></Panel></div>; }

    if (routeKey === "/admin/disputes/[id]") {
      const dispute = disputeRows.find((item) => item.id === recordId);
      if (!dispute) return <Panel title="Dispute not found"><p className="text-sm text-slate-600">This dispute is not in the demo records.</p></Panel>;
      const linkedBooking = allBookings.find((item) => item.id === dispute.bookingId);
      const canResolve = dispute.status === "open" && linkedBooking?.status === "disputed";
      return <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]"><Panel title="Case summary"><div className="grid gap-4 sm:grid-cols-2"><Info label="Case" value={dispute.id}/><Info label="Booking" value={dispute.bookingId}/><Info label="Issue type" value={dispute.reason}/><Info label="Status" value={dispute.status}/></div><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">Renter report</p><p className="mt-2 text-sm leading-6 text-slate-600">{dispute.description}</p></div>{dispute.resolutionNotes&&<p className="mt-4 text-sm text-slate-600">Resolution notes: {dispute.resolutionNotes}</p>}</Panel>{canResolve?<FormCard title="Resolution notes" fields={[{label:"Resolution",name:"resolution",options:[{label:"Choose an outcome",value:""},{label:"Resolved in renter’s favor",value:"Renter resolution"},{label:"Resolved in owner’s favor",value:"Owner resolution"},{label:"No action required",value:"No action"}]},{label:"Notes",name:"notes",type:"textarea",required:true,full:true}]} message={message} submitLabel="Record resolution" onSubmit={formAction((values)=>{if(updateCollectionRecord("disputes",recordId,{resolutionNotes:values.resolution + ": " + values.notes,resolvedBy:session.userId,status:"resolved",resolvedAt:isoNow()},disputeRows))transitionBooking(dispute.bookingId,"resolved");})}/>:<Panel title="Workflow closed"><p className="text-sm text-slate-600">This dispute is no longer open for resolution.</p></Panel>}</div>;
    }

    if (routeKey === "/admin/announcements") return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><FormCard title="New announcement" description="Share a clear update with renters and owners." fields={[{label:"Announcement title",name:"title",required:true,placeholder:"A short, helpful headline",full:true},{label:"Audience",name:"audience",options:[{label:"Everyone",value:"Everyone"},{label:"Renters",value:"Renters"},{label:"Owners",value:"Owners"}]},{label:"Publish date",name:"date",type:"date"},{label:"Message",name:"message",type:"textarea",required:true,full:true}]} message={message} submitLabel="Publish announcement" onSubmit={formAction((values)=>saveRecord("announcements",{id:makeId("announcement"),active:true,status:"Published",createdAt:isoNow(),createdBy:session.userId,...values}))}/><Panel title="Published announcements"><div className="space-y-3">{announcementRows.filter((item)=>item.active!==false).length?announcementRows.filter((item)=>item.active!==false).map((item)=><div key={item.id} className="rounded-xl border border-slate-100 p-4"><div className="flex justify-between gap-2"><strong>{item.title}</strong><Status>{item.status}</Status></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p><button onClick={()=>updateCollectionRecord("announcements",item.id,{active:false,status:"Inactive"},announcementRows)} className="mt-3 text-xs font-semibold text-rose-600">Deactivate</button></div>):<EmptyState title="No active announcements" text="Published updates will appear here."/>}</div></Panel></div>;

    if (routeKey === "/admin/reports") return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Bookings" value="248" note="This month"/><Metric label="Marketplace GMV" value="$48,260" note="+12.8% month over month"/><Metric label="Average booking" value="$194" note="Across all categories"/><Metric label="Cancellation rate" value="3.2%" note="Within target"/></div><div className="mt-5 grid gap-5 xl:grid-cols-2"><Panel title="Booking volume" action={<button onClick={()=>downloadCsv("platform-report.csv",allBookings)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold">Export report</button>}><EarningsChart/></Panel><Panel title="Fleet mix"><div className="space-y-4">{[["Luxury",42],["Premium SUV",31],["Exotic",18],["Sedan",9]].map(([label,value])=><div key={label}><div className="mb-1.5 flex justify-between text-sm"><span>{label}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{width:`${value}%`}}/></div></div>)}</div></Panel></div></>;

    return <div className="grid gap-5 md:grid-cols-2"><Panel title="Welcome"><p className="text-sm leading-6 text-slate-600">This page is ready for your Sheggar Wheels workflow. Use the navigation to continue.</p><div className="mt-4 flex flex-wrap gap-2"><ButtonLink href="/cars">Browse cars</ButtonLink><ButtonLink href="/dashboard" secondary>Dashboard</ButtonLink></div></Panel><Panel title="Your session"><p className="text-sm text-slate-500">{session.userId ? `Signed in as ${session.metadata?.name || "demo user"}` : "You are browsing as a guest."}</p></Panel></div>;
  }

  if (!isPublicRoute && !authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">Checking your demo session…</div>;
  }
  if (authRedirecting) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm font-medium text-slate-500">Taking you to sign in…</div>;
  }
  if ((!isPublicRoute && accessError) || accountSuspended) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Demo access</span><h1 className="mt-3 text-2xl font-semibold text-slate-950">{accountSuspended ? "Account access is suspended" : "This area needs a different role"}</h1><p className="mt-3 text-sm leading-6 text-slate-600">{accountSuspended ? "This demo account is suspended. No demo actions are available." : accessError}</p>{requiredRole === "owner" && !accountSuspended && <button onClick={()=>{const access=requireRole("renter");if(!access.ok){setMessage(access.message);return;}const roles=[...new Set([...normalizeRoles(access.user),"renter","owner"])];const nextSession={...session,metadata:{...session.metadata,roles}};const updatedUsers=(records.users||[]).map((user)=>user.id===session.userId?{...user,roles}:user);const savedUsers=writeUsers(updatedUsers);const savedSession=writeSession(nextSession);if(savedUsers.ok&&savedSession.ok){setRecords((value)=>({...value,users:updatedUsers}));setSession(nextSession);setAccessError("");}else setMessage(savedUsers.message||savedSession.message);}} className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">Enable owner capabilities</button>}{message&&<p className="mt-3 text-sm text-rose-700">{message}</p>}<div className="mt-5 flex gap-3"><ButtonLink href="/">Return home</ButtonLink><ButtonLink href="/signin" secondary>Switch account</ButtonLink></div><p className="mt-5 text-xs leading-5 text-slate-400">These role checks are for the front-end demo only and do not provide real security.</p></section></main>;
  }

  if (routeKey === "/cars/[id]" || routeKey === "/checkout") {
    // These focused renter flows keep the public navigation lightweight.
    return <div className="min-h-screen bg-slate-50"><PublicHeader session={session}/><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><PageHeading title={title} description={description}/>{renderContent()}</main></div>;
  }

  const crumbItems = routeKey.split("/").filter(Boolean);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicHeader session={session}/>
      <div className="mx-auto flex max-w-[1500px]">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{role} workspace</p>
          <nav aria-label={`${role} navigation`} className="mt-3 space-y-1">{nav.map(([label,href])=><Link key={label} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", routeKey===href?"bg-orange-50 text-orange-700":"text-slate-600 hover:bg-slate-50 hover:text-slate-950")}><span className="w-5 text-center text-base">{label==="Overview"?"⌂":label.includes("car")||label.includes("Fleet")?"◈":label.includes("Booking")?"▤":label.includes("Earning")?"$":label.includes("Dispute")?"!":label.includes("Review")?"☆":"◦"}</span>{label}</Link>)}</nav>
          <div className="mt-8 rounded-2xl bg-slate-950 p-4 text-white"><p className="text-sm font-semibold">Need a hand?</p><p className="mt-1 text-xs leading-5 text-slate-300">Our concierge team is here to help with your next step.</p><Link href="/bookings" className="mt-3 inline-block text-xs font-semibold text-orange-300">Visit support →</Link></div>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-400"><Link href="/" className="hover:text-orange-600">Home</Link>{crumbItems.map((part,index)=><span key={`${part}-${index}`} className="flex items-center gap-2"><span>/</span><span className={index===crumbItems.length-1?"text-slate-600":""}>{part.replaceAll("[id]",recordId||"detail").replaceAll("-"," ")}</span></span>)}</div>
          <PageHeading title={title} description={description}/>
          {role === "admin" && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">Admin access in this project is a seeded front-end demo role. These checks do not provide real security.</div>}
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(([label,href])=><Link key={label} href={href} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">{label}</Link>)}</div>
          {message && !["/cars","/cars/[id]","/checkout","/signin","/signup"].includes(routeKey) && <div role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
          {renderContent()}
          <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>© 2026 Sheggar Wheels · Demo data</span><span>Browser-based demo · No payments processed</span></footer>
        </main>
      </div>
    </div>
  );
}

function PublicHeader({ session }) {
  const router = useRouter();
  const roles = normalizeRoles(session.metadata);
  const accountPath = roles.includes("admin") ? "/admin" : roles.includes("owner") ? "/owner" : "/dashboard";
  function signOut() {
    signOutDemo();
    router.replace("/");
  }
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/" className="text-sm font-extrabold tracking-[0.16em] text-slate-950">SHEGGAR <span className="text-orange-500">WHEELS</span></Link><nav className="flex items-center gap-3 sm:gap-6"><Link href="/cars" className="text-sm font-semibold text-slate-600 hover:text-orange-600">Explore cars</Link><Link href="/signup" className="hidden text-sm font-semibold text-slate-600 hover:text-orange-600 sm:inline">Become an owner</Link>{session.userId?<><Link href={accountPath} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">My account</Link><button onClick={signOut} className="text-sm font-semibold text-slate-500 hover:text-rose-600">Sign out</button></>:<><Link href="/signin" className="text-sm font-semibold text-slate-600">Sign in</Link><Link href="/signup" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400">Join</Link></>}</nav></div></header>;
}

function PageHeading({ title, description }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function QuickAction({ href, title, text }) {
  return <Link href={href} className="block rounded-xl border border-slate-100 p-4 transition hover:border-orange-200 hover:bg-orange-50/50"><div className="flex items-center justify-between"><strong className="text-sm text-slate-900">{title}</strong><span className="text-orange-500">→</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></Link>;
}

function Info({ label, value }) {
  return <div><p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-800">{value || "—"}</p></div>;
}

function Timeline({ items }) {
  return <div className="space-y-0">{items.map(([title,text],index)=><div key={title} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><span className={cn("z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",index===0?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-500")}>{index+1}</span>{index<items.length-1&&<span className="absolute top-7 bottom-0 w-px bg-slate-200"/>}</div><div className="pt-1"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p></div></div>)}</div>;
}

function CalendarPreview() {
  return <div className="grid grid-cols-7 gap-1 text-center text-xs">{["M","T","W","T","F","S","S",...Array.from({length:30},(_,i)=>String(i+1))].map((day,index)=><span key={`${day}-${index}`} className={cn("flex h-9 items-center justify-center rounded-lg",index<7?"font-semibold text-slate-400":Number(day)%7===0?"bg-orange-100 font-semibold text-orange-700":"text-slate-600")}>{day}</span>)}</div>;
}

function EarningsChart() {
  const data=[42,58,48,69,61,78,58,86,72,94,76,100];
  return <div className="flex h-48 items-end gap-2 border-b border-slate-100 px-1">{data.map((height,index)=><div key={index} className="group flex h-full flex-1 flex-col justify-end"><div className="rounded-t-md bg-gradient-to-t from-orange-500 to-amber-300 transition group-hover:from-orange-600" style={{height:`${height}%`}}/><span className="py-2 text-center text-[10px] text-slate-400">{["J","F","M","A","M","J","J","A","S","O","N","D"][index]}</span></div>)}</div>;
}

function EmptyState({ title, text }) {
  return <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-xl text-orange-600">✦</div><h3 className="mt-3 font-semibold text-slate-900">{title}</h3><p className="mt-1 text-sm text-slate-500">{text}</p></div>;
}

