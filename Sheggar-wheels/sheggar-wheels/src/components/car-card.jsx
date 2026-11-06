"use client";

import Image from "next/image";
import ButtonLink from "@/components/button-link";
import { cn } from "@/components/component-utils";
import { formatETB } from "@/lib/format";

export default function CarCard({ car, reviews = [] }) {
  const carReviews = reviews.filter((review) => review.carId === car.id);
  const rating = carReviews.length ? (carReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / carReviews.length).toFixed(1) : null;
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("relative flex h-44 items-end justify-between overflow-hidden bg-gradient-to-br to-slate-200 p-5", car.accent || "from-orange-400/30")}>
        {car.photos?.[0] && <Image src={car.photos[0]} alt={car.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
        <span className="relative z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">{car.category || "Premium"}</span>
        <span className="relative z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">{rating ? `★ ${rating}` : "New listing"}</span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{car.name || "Premium vehicle"}</h3><p className="mt-1 text-xs text-slate-500">{car.location || "Addis Ababa"}</p></div><p className="shrink-0 text-right"><strong className="text-lg text-slate-950">{formatETB(car.pricePerDay ?? car.price ?? 150)}</strong><span className="block text-xs text-slate-500">per day</span></p></div>
        <div className="mt-4 flex gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500"><span>{car.seats || 5} seats</span><span>{car.transmission || "Automatic"}</span><span>{car.fuel || "Premium"}</span></div>
        <ButtonLink href={`/cars/${car.id || "car-audi-r8"}`}>View vehicle</ButtonLink>
      </div>
    </article>
  );
}
