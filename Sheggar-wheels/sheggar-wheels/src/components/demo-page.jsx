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
  readSession,
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

const demoCars = [
  { id: "car-audi-r8", name: "Audi R8 V10", category: "Exotic", location: "Bole International Airport", price: 285, seats: 2, transmission: "Automatic", status: "Available", accent: "from-red-500/30" },
  { id: "car-range-rover", name: "Range Rover Sport", category: "Premium SUV", location: "Addis Ababa", price: 190, seats: 5, transmission: "Automatic", status: "Available", accent: "from-amber-500/30" },
  { id: "car-mercedes-s", name: "Mercedes-Benz S-Class", category: "Luxury", location: "Bole International Airport", price: 220, seats: 5, transmission: "Automatic", status: "Available", accent: "from-blue-500/30" },
];

const demoBookings = [
  { id: "SW-24018", car: "Audi R8 V10", renter: "Maya Bekele", startDate: "2026-10-26", endDate: "2026-10-29", total: 855, status: "Confirmed" },
  { id: "SW-24016", car: "Range Rover Sport", renter: "Daniel Tesfaye", startDate: "2026-10-24", endDate: "2026-10-27", total: 570, status: "Active" },
  { id: "SW-24011", car: "Mercedes-Benz S-Class", renter: "Liya Alemu", startDate: "2026-10-18", endDate: "2026-10-20", total: 440, status: "Completed" },
];

const navGroups = {
  renter: [
    ["Overview", "/dashboard"],
    ["Find a car", "/cars"],
    ["My bookings", "/bookings"],
  ],
  owner: [
    ["Overview", "/owner"],
    ["My cars", "/owner/cars"],
    ["Bookings", "/owner/cars/car-audi-r8/bookings"],
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
  const status = String(children || "Pending");
  const style = /active|available|confirmed|approved|completed|resolved|published/i.test(status)
    ? "bg-emerald-50 text-emerald-700"
    : /reject|cancel|suspend|urgent|open/i.test(status)
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", style)}>{status}</span>;
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
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [draft, setDraft] = useState({ selectedDates: null, summary: null });

  useEffect(() => {
    const loaded = {};
    for (const [name, [reader]] of Object.entries(storeMethods)) loaded[name] = reader().data;
    setRecords((current) => ({ ...current, ...loaded }));
    setSession(readSession().data);
    setDraft(readCheckoutDraft().data);
  }, []);

  const [title, description] = routeInfo[routeKey] || ["Sheggar Wheels", "Manage your rental experience."];
  const role = routeKey.startsWith("/admin") ? "admin" : routeKey.startsWith("/owner") ? "owner" : "renter";
  const nav = navGroups[role];
  const allCars = records.cars?.length ? [...demoCars, ...records.cars] : demoCars;
  const allBookings = records.bookings?.length ? [...demoBookings, ...records.bookings] : demoBookings;
  const visibleCars = useMemo(() => allCars.filter((car) => {
    const matchesSearch = `${car.name} ${car.location} ${car.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || car.category?.toLowerCase().includes(filter.toLowerCase());
    return matchesSearch && matchesFilter;
  }).sort((a, b) => sort === "Price: low to high" ? Number(a.price) - Number(b.price) : sort === "Price: high to low" ? Number(b.price) - Number(a.price) : 0), [allCars, search, filter, sort]);

  function saveRecord(kind, record, { prepend = true } = {}) {
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
    const current = records.cars?.length ? records.cars : sourceRows;
    const updated = current.map((car) => car.id === id ? { ...car, status } : car);
    const result = writeCars(updated);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setRecords((value) => ({ ...value, cars: updated }));
    setMessage(`Listing ${status.toLowerCase()}.`);
  }

  function formAction(handler) {
    return (formData) => handler(Object.fromEntries(formData.entries()));
  }

  const userRows = records.users?.length ? records.users : [{ id: "demo-owner", name: "Maya Bekele", email: "maya@example.com", role: "Owner", status: "Active" }, { id: "demo-renter", name: "Daniel Tesfaye", email: "daniel@example.com", role: "Renter", status: "Active" }];
  const reviewRows = records.reviews?.length ? records.reviews : [{ id: "review-01", renter: "Maya B.", car: "Range Rover Sport", rating: "★★★★★", comment: "A seamless pickup and a beautiful drive.", status: "Published" }];
  const disputeRows = records.disputes?.length ? records.disputes : [{ id: "DSP-024", bookingId: "SW-24011", subject: "Fuel level at return", status: "In review", updated: "Today" }];
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
      const car = allCars.find((item) => item.id === recordId) || demoCars[0];
      return <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]"><div className="space-y-5"><div className="flex h-72 items-end rounded-3xl bg-gradient-to-br from-orange-200 via-slate-300 to-slate-700 p-7"><span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">{car.category}</span></div><Panel title="About this vehicle"><p className="leading-7 text-slate-600">Enjoy a carefully maintained {car.name} with a smooth automatic drive, flexible pickup, and attentive local support.</p><div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm"><div className="rounded-xl bg-slate-50 p-3"><strong>{car.seats || 2}</strong><span className="mt-1 block text-slate-500">Seats</span></div><div className="rounded-xl bg-slate-50 p-3"><strong>{car.transmission || "Auto"}</strong><span className="mt-1 block text-slate-500">Transmission</span></div><div className="rounded-xl bg-slate-50 p-3"><strong>4.9 ★</strong><span className="mt-1 block text-slate-500">Rating</span></div></div></Panel><Panel title="Pickup location"><p className="text-sm text-slate-600">{car.location}</p><p className="mt-2 text-xs text-slate-400">Exact pickup instructions are shared after the booking is confirmed.</p></Panel></div><Panel title="Reserve this car"><div className="mb-4"><strong className="text-3xl">${car.price}</strong><span className="text-slate-500"> / day</span></div><form action={(formData) => { const values = Object.fromEntries(formData.entries()); const checkout = { selectedDates: { startDate: values.startDate, endDate: values.endDate }, summary: { carId: car.id, car: car.name, price: car.price } }; const result = writeCheckoutDraft(checkout); if (!result.ok) { setMessage(result.message); return; } setDraft(checkout); router.push("/checkout"); }} className="space-y-4"><Field label="Pick-up date" name="startDate" type="date" required/><Field label="Return date" name="endDate" type="date" required/><p className="text-xs leading-5 text-slate-500">No payment details are collected in this demo.</p>{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}<button className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-400">Continue to checkout</button></form></Panel></div>;
    }

    if (routeKey === "/signin" || routeKey === "/signup") {
      const isSignup = routeKey === "/signup";
      return <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"><div className="hidden flex-col justify-between bg-slate-950 p-8 text-white md:flex"><span className="text-sm font-semibold tracking-[0.18em]">SHEGGAR WHEELS</span><div><p className="text-3xl font-semibold leading-tight">Your next great drive starts here.</p><p className="mt-3 text-sm leading-6 text-slate-300">A more personal way to discover and book premium cars.</p></div><span className="text-xs text-slate-400">Private fleet · Personal service</span></div><div className="p-6 sm:p-9"><h2 className="text-2xl font-semibold text-slate-950">{isSignup ? "Create your account" : "Welcome back"}</h2><p className="mt-2 text-sm text-slate-500">{isSignup ? "Set up a demo account in seconds." : "Sign in to continue to your dashboard."}</p><form action={formAction((values) => { const email = values.email.trim().toLowerCase(); const users = records.users || []; let user = users.find((item) => item.email === email); if (!user && isSignup) { user = { id: `user-${Date.now()}`, name: values.name, email, role: values.role || "Renter", status: "Active", createdAt: new Date().toISOString() }; saveRecord("users", user); } if (!user) { setMessage("No demo account was found for that email. Create an account to continue."); return; } const roleValue = String(user.role || "Renter").toLowerCase(); const result = writeSession({ userId: user.id, metadata: { role: roleValue, name: user.name || email } }); if (!result.ok) { setMessage(result.message); return; } setSession({ userId: user.id, metadata: { role: roleValue, name: user.name || email } }); setMessage("Signed in for this browser session."); })} className="mt-6 space-y-4">{isSignup && <><Field label="Full name" name="name" required placeholder="Your name"/><Field label="Account type" name="role" options={[{label:"Renter",value:"Renter"},{label:"Car owner",value:"Owner"}]}/></>}<Field label="Email address" name="email" type="email" required placeholder="you@example.com"/><Field label="Password" name="password" type="password" required placeholder="Enter any demo password"/><p className="text-xs leading-5 text-slate-500">Demo only. Passwords are never saved; sign-in matches an account by email.</p>{message && <p role="status" className="rounded-xl bg-orange-50 p-3 text-sm text-orange-800">{message}</p>}<button className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-orange-600">{isSignup ? "Create account" : "Sign in"}</button></form><p className="mt-5 text-center text-sm text-slate-500">{isSignup ? "Already have an account?" : "New to Sheggar Wheels?"} <Link className="font-semibold text-orange-600" href={isSignup ? "/signin" : "/signup"}>{isSignup ? "Sign in" : "Create account"}</Link></p></div></div>;
    }

    if (routeKey === "/dashboard" || routeKey === "/owner" || routeKey === "/admin") {
      const admin = routeKey === "/admin";
      const owner = routeKey === "/owner";
      return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label={admin ? "Gross bookings" : owner ? "This month" : "Upcoming trips"} value={admin ? "$48.2k" : owner ? "$4,820" : "2"} note={admin ? "+12.8% over last month" : owner ? "+8.2% from last month" : "Your next trip is Oct 26"}/><Metric label={admin ? "Active users" : owner ? "Active vehicles" : "Completed trips"} value={admin ? "1,284" : owner ? "4" : "8"} note="Updated just now" icon="◎"/><Metric label={admin ? "Pending listings" : owner ? "Utilization" : "Saved cars"} value={admin ? "12" : owner ? "76%" : "3"} note="Needs your attention" icon="◷"/><Metric label="Open items" value={admin ? "6" : owner ? "2" : "1"} note="Review when you have a moment" icon="!"/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]"><Panel title={admin ? "Marketplace activity" : owner ? "Recent bookings" : "Upcoming bookings"} action={<ButtonLink href={admin ? "/admin/bookings" : owner ? "/owner/cars/car-audi-r8/bookings" : "/bookings"}>View all</ButtonLink>}><DataTable columns={[{key:"id",label:"Booking"},{key:"car",label:"Vehicle"},{key:"startDate",label:"Dates"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]} rows={allBookings.slice(0,3)}/></Panel><Panel title="Quick actions"><div className="space-y-3"><QuickAction href={admin?"/admin/listings":owner?"/owner/cars/new":"/cars"} title={admin?"Review new listings":owner?"Add a vehicle":"Find a car"} text={admin?"Keep the marketplace current.":owner?"Share another vehicle.":"Explore available premium vehicles."}/><QuickAction href={admin?"/admin/disputes":owner?"/owner/earnings":"/bookings"} title={admin?"Resolve open disputes":owner?"View earnings":"Manage bookings"} text="Go straight to the details that need you."/></div></Panel></div></>;
    }

    if (["/bookings", "/owner/cars/[id]/bookings", "/admin/bookings"].includes(routeKey)) {
      const rows = routeKey === "/admin/bookings" ? allBookings : routeKey === "/owner/cars/[id]/bookings" ? allBookings.filter((item) => item.car?.includes("Audi") || item.carId === recordId) : allBookings;
      return <Panel title="Reservation activity" action={<div className="flex gap-2"><select className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs" value={filter} onChange={(event)=>setFilter(event.target.value)}><option>All</option><option>Confirmed</option><option>Active</option><option>Completed</option></select></div>}><DataTable columns={[{key:"id",label:"Booking ID"},{key:"car",label:"Vehicle"},{key:"renter",label:"Renter"},{key:"startDate",label:"Pick-up"},{key:"endDate",label:"Return"},{key:"total",label:"Total",render:(value)=><span>${value}</span>},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"",render:(value)=><Link className="font-semibold text-orange-600 hover:underline" href={`/bookings/${value}`}>Details</Link>}]} rows={rows.filter((item)=>filter==="All"||item.status===filter)}/></Panel>;
    }

    if (["/bookings/[id]", "/checkout"].includes(routeKey)) {
      const checkout = draft?.summary || { car: "Audi R8 V10", price: 285 };
      const dates = draft?.selectedDates || { startDate: "2026-10-26", endDate: "2026-10-29" };
      return <div className="grid gap-5 xl:grid-cols-[1.3fr_0.8fr]"><div className="space-y-5"><Panel title="Trip details"><div className="grid gap-4 sm:grid-cols-2"><Info label="Vehicle" value={checkout.car || "Audi R8 V10"}/><Info label="Pick-up" value={dates.startDate || "Choose a date"}/><Info label="Return" value={dates.endDate || "Choose a date"}/><Info label="Pick-up location" value="Bole International Airport"/></div></Panel><Panel title="Pickup instructions"><p className="text-sm leading-6 text-slate-600">Your host will share the exact meeting point and contact details after the booking is confirmed.</p></Panel><Panel title="Payment"><p className="text-sm leading-6 text-slate-600">This is a demo checkout. No payment details are collected or processed.</p></Panel></div><Panel title="Price summary"><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Rental estimate</span><strong>${Number(checkout.price || 285) * 3}</strong></div><div className="flex justify-between"><span className="text-slate-500">Service fee</span><strong>$35</strong></div><div className="flex justify-between border-t border-slate-100 pt-3 text-base"><span>Total</span><strong>${Number(checkout.price || 285) * 3 + 35}</strong></div></div><p className="my-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">Mock payment review only. Payment credentials are never stored.</p><button onClick={()=>{const id=`SW-${Date.now().toString().slice(-6)}`;const ok=saveRecord("bookings",{id,car:checkout.car||"Audi R8 V10",carId:checkout.carId||"car-audi-r8",renter:session.metadata?.name||"Demo renter",startDate:dates.startDate||"2026-10-26",endDate:dates.endDate||"2026-10-29",total:Number(checkout.price||285)*3+35,status:"Confirmed"});if(ok)setMessage("Demo booking confirmed. No payment was taken.");}} className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-400">Confirm demo booking</button>{message && <div role="status" className="mt-3 text-sm text-emerald-700">{message}<Link href="/bookings" className="ml-2 font-semibold underline">View bookings</Link></div>}</Panel></div>;
    }

    if (routeKey === "/bookings/[id]/track") return <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Trip status"><div className="rounded-2xl bg-gradient-to-br from-slate-100 to-emerald-50 p-6"><div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70"><div className="text-center"><span className="text-4xl">⌖</span><p className="mt-2 font-semibold text-slate-800">Pickup route preview</p><p className="mt-1 text-sm text-slate-500">Live location is simulated in this demo.</p></div></div></div></Panel><Panel title="Trip timeline"><Timeline items={[["Booking confirmed","Your reservation is ready."],["Host preparing vehicle","Pickup details will appear here."],["Trip in progress","Tracking begins at pickup."],["Return vehicle","Complete your trip and leave a review."]]}/></Panel></div>;

    if (routeKey === "/bookings/[id]/review") return <FormCard title="Rate your rental" description="Your review helps future renters and supports great hosts." fields={[{label:"Overall rating",name:"rating",options:[{label:"★★★★★ Excellent",value:"5"},{label:"★★★★☆ Very good",value:"4"},{label:"★★★☆☆ Good",value:"3"},{label:"★★☆☆☆ Fair",value:"2"},{label:"★☆☆☆☆ Poor",value:"1"}]},{label:"Vehicle",name:"car",defaultValue:"Audi R8 V10"},{label:"Your review",name:"comment",type:"textarea",required:true,full:true,placeholder:"How was the car and pickup experience?"}]} message={message} submitLabel="Submit review" onSubmit={formAction((values)=>saveRecord("reviews",{id:`review-${Date.now()}`,renter:session.metadata?.name||"Demo renter",car:values.car,rating:`${values.rating} ★`,comment:values.comment,status:"Published",createdAt:new Date().toISOString()}))}/>;

    if (routeKey === "/owner/cars" || routeKey === "/admin/listings") {
      const isModeration = routeKey === "/admin/listings";
      const rows = records.cars?.length ? records.cars : demoCars.map((car)=>({...car,owner:"Maya Bekele",status:isModeration?"Pending review":"Approved"}));
      return <><Panel title={isModeration ? "Listings awaiting review" : "Your vehicles"} action={!isModeration ? <ButtonLink href="/owner/cars/new">+ Add a vehicle</ButtonLink> : null}><DataTable columns={[{key:"name",label:"Vehicle"},{key:"location",label:"Location"},{key:"category",label:"Category"},{key:"price",label:"Daily rate",render:(value)=><span>${value}/day</span>},{key:"status",label:"Status",render:(value)=><Status>{value||"Pending review"}</Status>},{key:"id",label:"Actions",render:(value,row)=>isModeration?<div className="flex gap-2"><button onClick={()=>updateCarStatus(value,"Approved",rows)} className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100">Approve</button><button onClick={()=>updateCarStatus(value,"Rejected",rows)} className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">Reject</button></div>:<div className="flex gap-3"><Link className="font-semibold text-orange-600" href={`/owner/cars/${value}/edit`}>Edit</Link><Link className="font-semibold text-slate-600" href={`/owner/cars/${value}/availability`}>Availability</Link></div>}]} rows={rows}/></Panel>{message&&<p role="status" className="mt-3 text-sm text-emerald-700">{message}</p>}</>;
    }

    if (["/owner/cars/new", "/owner/cars/[id]/edit"].includes(routeKey)) return <FormCard title={routeKey.endsWith("new")?"Vehicle details":"Update your vehicle"} description="Share clear, accurate details to help renters choose confidently." fields={[{label:"Vehicle name",name:"name",required:true,placeholder:"e.g. Audi R8 V10"},{label:"Category",name:"category",options:[{label:"Luxury",value:"Luxury"},{label:"Exotic",value:"Exotic"},{label:"Premium SUV",value:"Premium SUV"},{label:"Sedan",value:"Sedan"}]},{label:"Daily rate (USD)",name:"price",type:"number",required:true,min:"1",placeholder:"150"},{label:"Seats",name:"seats",type:"number",min:"1",defaultValue:"5"},{label:"Transmission",name:"transmission",options:[{label:"Automatic",value:"Automatic"},{label:"Manual",value:"Manual"}]},{label:"Pickup location",name:"location",required:true,placeholder:"City or airport"},{label:"Description",name:"description",type:"textarea",full:true,placeholder:"Describe the vehicle and pickup experience"}]} message={message} submitLabel="Save vehicle listing" onSubmit={formAction((values)=>saveRecord("cars",{id:`car-${Date.now()}`,...values,price:Number(values.price),seats:Number(values.seats),status:"Pending review",owner:session.metadata?.name||"Demo owner"}))}/>;

    if (routeKey === "/owner/cars/[id]/availability") return <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]"><FormCard title="Availability settings" description="Set the dates when renters can request this vehicle." fields={[{label:"Available from",name:"availableFrom",type:"date",required:true},{label:"Available until",name:"availableUntil",type:"date",required:true},{label:"Minimum rental (days)",name:"minimumDays",type:"number",min:"1",defaultValue:"1"},{label:"Notice period",name:"notice",options:[{label:"Same day",value:"0"},{label:"1 day",value:"1"},{label:"2 days",value:"2"},{label:"1 week",value:"7"}]}]} message={message} submitLabel="Save availability" onSubmit={formAction((values)=>setMessage(`Availability saved: ${values.availableFrom} to ${values.availableUntil}.`))}/><Panel title="This month"><CalendarPreview/></Panel></div>;

    if (routeKey === "/owner/earnings") return <><div className="grid gap-4 sm:grid-cols-3"><Metric label="Gross earnings" value="$12,840" note="Year to date"/><Metric label="Available payout" value="$1,920" note="Ready for payout" icon="$"/><Metric label="Occupancy" value="76%" note="Across your fleet" icon="◷"/></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><Panel title="Monthly earnings"><EarningsChart/></Panel><Panel title="Recent payouts"><DataTable columns={[{key:"date",label:"Date"},{key:"reference",label:"Reference"},{key:"amount",label:"Amount"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]} rows={[{date:"Oct 18",reference:"PO-0818",amount:"$1,240",status:"Paid"},{date:"Oct 04",reference:"PO-0804",amount:"$980",status:"Paid"},{date:"Sep 20",reference:"PO-0920",amount:"$1,560",status:"Paid"}]}/></Panel></div></>;

    if (["/owner/reviews", "/admin/users", "/admin/disputes", "/owner/disputes"].includes(routeKey)) {
      const reviews = routeKey === "/owner/reviews";
      const users = routeKey === "/admin/users";
      const disputes = routeKey.includes("disputes");
      const rows = reviews ? reviewRows : users ? userRows : disputeRows;
      return <Panel title={reviews?"Latest reviews":users?"Marketplace accounts":"Open cases"} action={reviews?<span className="text-xs text-slate-500">Average 4.9 ★</span>:null}><DataTable columns={reviews?[{key:"renter",label:"Renter"},{key:"car",label:"Vehicle"},{key:"rating",label:"Rating"},{key:"comment",label:"Review"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>}]:users?[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"role",label:"Role"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"",render:(value)=><Link className="font-semibold text-orange-600" href={`/admin/users/${value}`}>View account</Link>}]:[{key:"id",label:"Case"},{key:"bookingId",label:"Booking"},{key:"subject",label:"Issue"},{key:"updated",label:"Updated"},{key:"status",label:"Status",render:(value)=><Status>{value}</Status>},{key:"id",label:"",render:(value)=><Link className="font-semibold text-orange-600" href={`/admin/disputes/${value}`}>Review</Link>}]} rows={rows}/></Panel>;
    }

    if (routeKey === "/admin/users/[id]") { const user=userRows.find((item)=>item.id===recordId)||userRows[0]; return <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Panel title="Account summary"><div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-xl font-semibold text-orange-700">{user?.name?.[0]||"U"}</div><div><h3 className="font-semibold text-slate-950">{user?.name}</h3><p className="text-sm text-slate-500">{user?.email}</p></div></div><div className="mt-5 grid grid-cols-2 gap-3"><Info label="Role" value={user?.role}/><Info label="Account status" value={user?.status}/><Info label="Member since" value="October 2026"/><Info label="Completed trips" value="4"/></div><button onClick={()=>setMessage("Account status updated for this demo.")} className="mt-5 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50">Suspend account</button>{message&&<p role="status" className="mt-3 text-sm text-slate-500">{message}</p>}</Panel><Panel title="Recent activity"><Timeline items={[["Account created","Demo profile is active."],["First booking","Reservation SW-24011 completed."],["Latest sign-in","Current browser session."]]}/></Panel></div>; }

    if (routeKey === "/admin/disputes/[id]") return <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]"><Panel title="Case summary"><div className="grid gap-4 sm:grid-cols-2"><Info label="Case" value={recordId||"DSP-024"}/><Info label="Booking" value="SW-24011"/><Info label="Issue type" value="Vehicle condition"/><Info label="Status" value="In review"/></div><div className="mt-5 rounded-xl bg-slate-50 p-4"><p className="text-sm font-semibold">Renter report</p><p className="mt-2 text-sm leading-6 text-slate-600">The vehicle was returned with a different fuel level than recorded at pickup. Both parties have been asked to share their notes.</p></div></Panel><FormCard title="Resolution notes" fields={[{label:"Resolution",name:"resolution",options:[{label:"Choose an outcome",value:""},{label:"Resolved in renter’s favor",value:"Renter resolution"},{label:"Resolved in owner’s favor",value:"Owner resolution"},{label:"No action required",value:"No action"}]},{label:"Notes",name:"notes",type:"textarea",required:true,full:true}]} message={message} submitLabel="Record resolution" onSubmit={formAction((values)=>{const result=saveRecord("disputes",{id:recordId||`DSP-${Date.now()}`,bookingId:"SW-24011",subject:values.resolution,notes:values.notes,status:"Resolved",updated:new Date().toLocaleDateString()});if(result)setMessage("Resolution recorded.");})}/></div>;

    if (routeKey === "/admin/announcements") return <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><FormCard title="New announcement" description="Share a clear update with renters and owners." fields={[{label:"Announcement title",name:"title",required:true,placeholder:"A short, helpful headline",full:true},{label:"Audience",name:"audience",options:[{label:"Everyone",value:"Everyone"},{label:"Renters",value:"Renters"},{label:"Owners",value:"Owners"}]},{label:"Publish date",name:"date",type:"date"},{label:"Message",name:"message",type:"textarea",required:true,full:true}]} message={message} submitLabel="Publish announcement" onSubmit={formAction((values)=>saveRecord("announcements",{id:`announcement-${Date.now()}`,status:"Published",...values}))}/><Panel title="Published announcements"><div className="space-y-3">{announcementRows.length?announcementRows.map((item)=><div key={item.id} className="rounded-xl border border-slate-100 p-4"><div className="flex justify-between gap-2"><strong>{item.title}</strong><Status>{item.status}</Status></div><p className="mt-2 text-sm leading-6 text-slate-600">{item.message}</p></div>):<EmptyState title="No announcements yet" text="Published updates will appear here."/>}</div></Panel></div>;

    if (routeKey === "/admin/reports") return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Bookings" value="248" note="This month"/><Metric label="Marketplace GMV" value="$48,260" note="+12.8% month over month"/><Metric label="Average booking" value="$194" note="Across all categories"/><Metric label="Cancellation rate" value="3.2%" note="Within target"/></div><div className="mt-5 grid gap-5 xl:grid-cols-2"><Panel title="Booking volume"><EarningsChart/></Panel><Panel title="Fleet mix"><div className="space-y-4">{[["Luxury",42],["Premium SUV",31],["Exotic",18],["Sedan",9]].map(([label,value])=><div key={label}><div className="mb-1.5 flex justify-between text-sm"><span>{label}</span><strong>{value}%</strong></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{width:`${value}%`}}/></div></div>)}</div></Panel></div></>;

    return <div className="grid gap-5 md:grid-cols-2"><Panel title="Welcome"><p className="text-sm leading-6 text-slate-600">This page is ready for your Sheggar Wheels workflow. Use the navigation to continue.</p><div className="mt-4 flex flex-wrap gap-2"><ButtonLink href="/cars">Browse cars</ButtonLink><ButtonLink href="/dashboard" secondary>Dashboard</ButtonLink></div></Panel><Panel title="Your session"><p className="text-sm text-slate-500">{session.userId ? `Signed in as ${session.metadata?.name || "demo user"}` : "You are browsing as a guest."}</p></Panel></div>;
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
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">{nav.map(([label,href])=><Link key={label} href={href} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">{label}</Link>)}</div>
          {message && !["/cars","/cars/[id]","/checkout","/signin","/signup"].includes(routeKey) && <div role="status" className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
          {renderContent()}
          <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>© 2026 Sheggar Wheels · Demo marketplace</span><span>Browser-based demo · No payments processed</span></footer>
        </main>
      </div>
    </div>
  );
}

function PublicHeader({ session }) {
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/" className="text-sm font-extrabold tracking-[0.16em] text-slate-950">SHEGGAR <span className="text-orange-500">WHEELS</span></Link><nav className="flex items-center gap-3 sm:gap-6"><Link href="/cars" className="text-sm font-semibold text-slate-600 hover:text-orange-600">Explore cars</Link><Link href="/owner" className="hidden text-sm font-semibold text-slate-600 hover:text-orange-600 sm:inline">Become an owner</Link>{session.userId?<Link href={session.metadata?.role==="admin"?"/admin":session.metadata?.role==="owner"?"/owner":"/dashboard"} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">My account</Link>:<><Link href="/signin" className="text-sm font-semibold text-slate-600">Sign in</Link><Link href="/signup" className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400">Join</Link></>}</nav></div></header>;
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
