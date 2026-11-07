"use client";

import { useState } from "react";
import { formatETB } from "@/lib/format";

const earningStatuses = new Set([
  "confirmed",
  "in_progress",
  "completed",
  "reviewed",
  "disputed",
  "resolved",
]);

const rangeOptions = [
  ["monthly", "Monthly"],
  ["weekly", "Weekly"],
  ["daily", "Daily"],
  ["hourly", "Hourly"],
];

const rangeLabels = Object.fromEntries(rangeOptions);

function startOfWeek(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfPeriod(date, range) {
  const start = new Date(date);
  if (range === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  if (range === "weekly") return startOfWeek(start);
  if (range === "daily") start.setHours(0, 0, 0, 0);
  if (range === "hourly") start.setMinutes(0, 0, 0);
  return start;
}

function formatWeekInput(date) {
  const thursday = startOfWeek(date);
  thursday.setDate(thursday.getDate() + 3);
  const yearStart = new Date(thursday.getFullYear(), 0, 4);
  const week = Math.floor((thursday - startOfWeek(yearStart)) / 604800000) + 1;
  return `${thursday.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTimeInput(date) {
  return `${formatDateInput(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getPickerRange(range) {
  if (range === "monthly") return "yearly";
  if (range === "weekly") return "monthly";
  if (range === "daily") return "weekly";
  return "daily";
}

function getPeriodInputValue(date, range) {
  const pickerRange = getPickerRange(range);
  if (pickerRange === "yearly") return String(date.getFullYear());
  if (pickerRange === "monthly") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  if (pickerRange === "weekly") return formatWeekInput(date);
  return formatDateInput(date);
}

function parsePeriodInputValue(value, range) {
  if (!value) return null;
  const pickerRange = getPickerRange(range);
  if (pickerRange === "yearly") return new Date(Number(value), 0, 1);
  if (pickerRange === "monthly") return new Date(`${value}-01T00:00:00`);
  if (pickerRange === "weekly") {
    const match = /^(\d{4})-W(\d{2})$/.exec(value);
    if (!match) return null;
    const januaryFourth = new Date(Number(match[1]), 0, 4);
    const weekStart = startOfWeek(januaryFourth);
    weekStart.setDate(weekStart.getDate() + (Number(match[2]) - 1) * 7);
    return weekStart;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function shiftDate(date, range, amount) {
  const shifted = new Date(date);
  if (range === "monthly") shifted.setMonth(shifted.getMonth() + amount);
  else if (range === "weekly") shifted.setDate(shifted.getDate() + amount * 7);
  else if (range === "daily") shifted.setDate(shifted.getDate() + amount);
  else shifted.setHours(shifted.getHours() + amount);
  return shifted;
}

function getPeriodEnd(start, range) {
  return shiftDate(start, range, 1);
}

function formatMonth(date) {
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

function formatDay(date) {
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function describePeriod(period, range) {
  const { start, end } = period;
  if (range === "monthly") return formatMonth(start);
  if (range === "weekly") {
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return `${start.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}–${lastDay.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (range === "daily") return start.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  return start.toLocaleString("en", { dateStyle: "medium", hour: "numeric" });
}

function formatPeriod(period, range) {
  const { start, end } = period;
  if (range === "monthly") return start.toLocaleDateString("en", { month: "short" });
  if (range === "weekly") {
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() - 1);
    return start.getMonth() === lastDay.getMonth()
      ? `${start.getDate()}–${lastDay.getDate()}`
      : `${formatDay(start)}–${formatDay(lastDay)}`;
  }
  if (range === "daily") return start.toLocaleDateString("en", { weekday: "short" });
  return start.toLocaleTimeString("en", { hour: "numeric" });
}

function makePeriod(start, range, end = getPeriodEnd(start, range)) {
  return { start, end, label: formatPeriod({ start, end }, range) };
}

function getPeriods(range, selectedDate, anchor) {
  if (!anchor && range === "monthly") {
    const yearStart = new Date(selectedDate.getFullYear(), 0, 1);
    return Array.from({ length: 12 }, (_, index) =>
      makePeriod(new Date(yearStart.getFullYear(), index, 1), range)
    );
  }

  if (!anchor && range === "weekly") {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    const periods = [];
    for (let weekStart = startOfWeek(monthStart); weekStart < monthEnd; weekStart = shiftDate(weekStart, "weekly", 1)) {
      const weekEnd = getPeriodEnd(weekStart, "weekly");
      const start = new Date(Math.max(weekStart.getTime(), monthStart.getTime()));
      const end = new Date(Math.min(weekEnd.getTime(), monthEnd.getTime()));
      periods.push(makePeriod(start, range, end));
    }
    return periods;
  }

  if (!anchor && range === "daily") {
    const weekStart = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) =>
      makePeriod(shiftDate(weekStart, "daily", index), range)
    );
  }

  if (!anchor && range === "hourly") {
    const dayStart = startOfPeriod(selectedDate, "daily");
    return Array.from({ length: 24 }, (_, index) =>
      makePeriod(shiftDate(dayStart, "hourly", index), range)
    );
  }

  if (range === "weekly" && anchor) {
    const periods = [];
    for (let weekStart = startOfWeek(anchor.start); weekStart < anchor.end; weekStart = shiftDate(weekStart, "weekly", 1)) {
      const weekEnd = getPeriodEnd(weekStart, "weekly");
      const start = new Date(Math.max(weekStart.getTime(), anchor.start.getTime()));
      const end = new Date(Math.min(weekEnd.getTime(), anchor.end.getTime()));
      periods.push(makePeriod(start, range, end));
    }
    return periods;
  }

  if (range === "daily" && anchor) {
    const periods = [];
    for (let day = new Date(anchor.start); day < anchor.end; day = shiftDate(day, "daily", 1)) {
      periods.push(makePeriod(day, range, new Date(Math.min(getPeriodEnd(day, range).getTime(), anchor.end.getTime()))));
    }
    return periods;
  }

  if (range === "hourly" && anchor) {
    return Array.from({ length: 24 }, (_, index) => {
      const start = shiftDate(anchor.start, "hourly", index);
      return makePeriod(start, range, new Date(Math.min(getPeriodEnd(start, range).getTime(), anchor.end.getTime())));
    });
  }

  return [];
}

function getBookingDate(booking) {
  const value = booking.createdAt || booking.startDate;
  if (!value) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export default function EarningsChart({ bookings = [] }) {
  const [range, setRange] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [drillPath, setDrillPath] = useState([]);
  const currentRange = drillPath.length ? drillPath[drillPath.length - 1].range : range;
  const anchor = drillPath.length ? drillPath[drillPath.length - 1].period : null;
  const anchorRange = drillPath.length === 1 ? range : drillPath[drillPath.length - 2]?.range;
  const periods = getPeriods(currentRange, selectedDate, anchor);
  const pickerRange = getPickerRange(range);
  const pickerLabel = pickerRange === "yearly" ? "year" : pickerRange === "monthly" ? "month" : pickerRange === "weekly" ? "week" : "day";
  const description = anchor
    ? `Showing ${currentRange} breakdown for ${describePeriod(anchor, anchorRange)}`
    : range === "monthly"
      ? `Showing earnings for ${selectedDate.getFullYear()}`
      : range === "weekly"
        ? `Showing weeks in ${formatMonth(selectedDate)}`
        : range === "daily"
          ? `Showing days in the week of ${formatDay(startOfWeek(selectedDate))}`
          : `Showing hours on ${selectedDate.toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`;
  const data = periods.map((period) => bookings
    .filter((booking) => {
      if (!earningStatuses.has(booking.status)) return false;
      const date = getBookingDate(booking);
      return date && date >= period.start && date < period.end;
    })
    .reduce((sum, booking) => sum + Number(booking.total || 0), 0));
  const max = Math.max(1, ...data);

  function drillInto(period) {
    const nextRange = currentRange === "monthly" ? "weekly" : currentRange === "weekly" ? "daily" : currentRange === "daily" ? "hourly" : null;
    if (!nextRange) return;
    setDrillPath((path) => [...path, { range: nextRange, period }]);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div aria-label="Earnings chart time range" className="flex flex-wrap gap-2" role="group">
          {rangeOptions.map(([value, label]) => (
            <button
              aria-pressed={range === value && drillPath.length === 0}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${range === value && drillPath.length === 0 ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              key={value}
              onClick={() => {
                setRange(value);
                setDrillPath([]);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
          <span>{`Choose ${pickerLabel}`}</span>
          <input
            aria-label={`Choose ${pickerLabel} for earnings`}
            className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-700"
            onChange={(event) => {
              const date = parsePeriodInputValue(event.target.value, range);
              if (!date || !Number.isFinite(date.getTime())) return;
              setSelectedDate(date);
              setDrillPath([]);
            }}
            step={pickerRange === "yearly" ? 1 : undefined}
            type={pickerRange === "yearly" ? "number" : pickerRange === "monthly" ? "month" : pickerRange === "weekly" ? "week" : "date"}
            value={getPeriodInputValue(selectedDate, range)}
          />
        </label>
      </div>
      {drillPath.length > 0 && (
        <nav aria-label="Earnings chart drill-down" className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <button className="font-semibold text-orange-700 hover:underline" onClick={() => setDrillPath([])} type="button">
            {rangeLabels[range]}
          </button>
          {drillPath.map((item, index) => (
            <span className="flex items-center gap-2" key={`${item.period.start.toISOString()}-${item.range}`}>
              <span aria-hidden="true" className="text-slate-400">/</span>
              {index === drillPath.length - 1
                ? <span aria-current="location" className="font-medium text-slate-700">{item.period.label}</span>
                : <button className="font-semibold text-orange-700 hover:underline" onClick={() => setDrillPath((path) => path.slice(0, index + 1))} type="button">{item.period.label}</button>}
            </span>
          ))}
        </nav>
      )}
      <div aria-label={`${currentRange} earnings`} className="overflow-x-auto">
        <div className={`flex h-48 items-end gap-2 border-b border-slate-100 px-1 ${currentRange === "hourly" ? "min-w-[640px]" : ""}`} role="group">
          {data.map((amount, index) => {
            const period = periods[index];
            const canDrillDown = currentRange !== "hourly";
            return (
              <button
                aria-label={`${formatPeriod(period, currentRange)}: ${formatETB(amount)}${canDrillDown ? `, expand to ${rangeLabels[currentRange === "monthly" ? "weekly" : currentRange === "weekly" ? "daily" : "hourly"]}` : ""}`}
                className="earnings-chart-column group flex h-full min-w-0 flex-1 flex-col justify-end text-center focus-visible:outline-2 focus-visible:outline-offset-2"
                key={`${period.start.toISOString()}-${period.end.toISOString()}`}
                onClick={() => drillInto(period)}
                title={`${period.label}: ${formatETB(amount)}${canDrillDown ? " · Click to expand" : ""}`}
                type="button"
              >
                <span className="sr-only">{formatETB(amount)}</span>
                <span
                  aria-hidden="true"
                  className={`earnings-chart-bar rounded-t-md transition ${amount ? "" : "opacity-30"}`}
                  style={{ height: amount ? `${Math.max(4, (amount / max) * 100)}%` : "4%" }}
                />
                <span className="py-2 text-[10px] text-slate-400">{period.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {description}. Select a bar to expand it into the next level.
      </p>
    </div>
  );
}
