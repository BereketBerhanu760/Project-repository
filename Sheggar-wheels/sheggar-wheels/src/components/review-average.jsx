"use client";



export default function ReviewAverage({ reviews = [] }) { const average = reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1) : null; return <span className="text-xs text-slate-500">{average ? "Average " + average + " ★" : "No reviews yet"}</span>; }
