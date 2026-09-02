"use client";

import BookNowButton from "@/components/BookNowButton";
import {
  checkPackageAvailabilityDate,
  getPackageAvailability,
  type PackageAvailabilityDay,
  type PackageAvailabilityStatus,
} from "@/lib/api";
import { formatDisplayDate, monthLabel, shiftMonth, todayIsoDate, weekdayLabels } from "@/lib/date-utils";
import type { Package } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

interface PackageAvailabilityCalendarProps {
  pkg: Package;
  backHref: string;
}

function statusStyles(status: PackageAvailabilityStatus, selected: boolean) {
  if (selected) {
    return "border-[#23406e] bg-[#23406e] text-white ring-2 ring-[#23406e]/30";
  }

  switch (status) {
    case "available":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400";
    case "limited":
      return "border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-400";
    case "full":
      return "border-red-200 bg-red-50 text-red-700 cursor-not-allowed opacity-80";
    default:
      return "border-[#d9dee8] bg-[#f5f7fa] text-muted cursor-not-allowed opacity-60";
  }
}

function statusLabel(day: PackageAvailabilityDay) {
  switch (day.status) {
    case "available":
      return `${day.available_seats} seats available`;
    case "limited":
      return `Only ${day.available_seats} seat${day.available_seats === 1 ? "" : "s"} left`;
    case "full":
      return "Fully booked";
    default:
      return "Past date";
  }
}

function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-muted">
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-emerald-400" />
        Available
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-amber-400" />
        Limited seats
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        Full
      </span>
    </div>
  );
}

export default function PackageAvailabilityCalendar({ pkg, backHref }: PackageAvailabilityCalendarProps) {
  const today = useMemo(() => todayIsoDate(), []);
  const initial = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }, []);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);
  const [days, setDays] = useState<PackageAvailabilityDay[]>([]);
  const [totalSeats, setTotalSeats] = useState(pkg.group_size_max ?? 6);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<PackageAvailabilityDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPackageAvailability(pkg.slug, viewYear, viewMonth);
      setDays(data.days);
      setTotalSeats(data.total_seats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load availability.");
      setDays([]);
    } finally {
      setLoading(false);
    }
  }, [pkg.slug, viewMonth, viewYear]);

  useEffect(() => {
    void loadMonth();
  }, [loadMonth]);

  async function handleSelectDay(day: PackageAvailabilityDay) {
    if (day.status === "past" || day.status === "full") {
      return;
    }

    setSelectedDate(day.date);
    setSelectedDay(day);
    setChecking(true);
    setError("");

    try {
      const result = await checkPackageAvailabilityDate(pkg.slug, day.date);
      setSelectedDay(result.day);
      if (result.day.status === "full" || result.day.status === "past") {
        setSelectedDate(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify seat availability.");
    } finally {
      setChecking(false);
    }
  }

  function goMonth(delta: number) {
    const next = shiftMonth(viewYear, viewMonth, delta);
    setViewYear(next.year);
    setViewMonth(next.month);
  }

  const monthStart = new Date(viewYear, viewMonth - 1, 1);
  const leadingBlanks = monthStart.getDay();
  const monthDays = days;
  const dayMap = useMemo(() => new Map(monthDays.map((day) => [day.date, day])), [monthDays]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#d9dee8] bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#23406e]">Choose Your Trip Dates</h3>
            <p className="mt-1 text-sm text-muted">
              Select a start date to see the {pkg.duration_days}-day itinerary window and remaining seats.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="rounded-lg border border-[#d9dee8] px-3 py-2 text-sm font-semibold text-[#23406e] hover:bg-[#eef1f6]"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="min-w-[10rem] text-center text-sm font-semibold text-[#23406e]">
              {monthLabel(viewYear, viewMonth)}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="rounded-lg border border-[#d9dee8] px-3 py-2 text-sm font-semibold text-[#23406e] hover:bg-[#eef1f6]"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <CalendarLegend />

        <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-muted">
          {weekdayLabels().map((label) => (
            <div key={label} className="py-2">
              {label}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-muted">Loading calendar...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: leadingBlanks }).map((_, index) => (
              <div key={`blank-${index}`} />
            ))}
            {Array.from({ length: monthStart.getDate() ? new Date(viewYear, viewMonth, 0).getDate() : 0 }).map((_, index) => {
              const dayNumber = index + 1;
              const dateValue = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
              const day = dayMap.get(dateValue);
              const isSelected = selectedDate === dateValue;
              const disabled = !day || day.status === "past" || day.status === "full";

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={disabled}
                  onClick={() => day && handleSelectDay(day)}
                  className={`min-h-[4.5rem] rounded-lg border px-1 py-2 text-left transition ${statusStyles(day?.status || "past", isSelected)}`}
                >
                  <span className="block text-sm font-bold">{dayNumber}</span>
                  {day && day.status !== "past" ? (
                    <span className={`mt-1 block text-[10px] leading-tight ${isSelected ? "text-white/90" : ""}`}>
                      {day.status === "full" ? "Full" : `${day.available_seats}/${day.total_seats}`}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-xs text-muted">
          Group capacity: up to {totalSeats} seats per departure. Numbers show available seats for each start date.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="rounded-xl border border-[#d9dee8] bg-[#eef1f6] p-5 md:p-6">
        <h3 className="text-lg font-bold text-[#23406e]">Availability Summary</h3>

        {!selectedDay || !selectedDate ? (
          <p className="mt-3 text-sm text-muted">Pick an available date on the calendar to check seats and trip duration.</p>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#d9dee8] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Start Date</p>
                <p className="mt-2 font-semibold text-[#23406e]">{formatDisplayDate(selectedDay.date)}</p>
              </div>
              <div className="rounded-lg border border-[#d9dee8] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">End Date</p>
                <p className="mt-2 font-semibold text-[#23406e]">{formatDisplayDate(selectedDay.end_date)}</p>
              </div>
              <div className="rounded-lg border border-[#d9dee8] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Duration</p>
                <p className="mt-2 font-semibold text-[#23406e]">{selectedDay.duration_days} days</p>
              </div>
              <div className="rounded-lg border border-[#d9dee8] bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-[#23406e]">Seat Availability</p>
                <p
                  className={`mt-2 font-semibold ${
                    selectedDay.status === "limited" ? "text-amber-700" : selectedDay.status === "full" ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {checking ? "Checking..." : statusLabel(selectedDay)}
                </p>
              </div>
            </div>

            {selectedDay.status !== "full" && selectedDay.status !== "past" ? (
              <BookNowButton pkg={pkg} backHref={backHref} bookingDate={selectedDate} />
            ) : (
              <p className="text-sm text-red-600">This date is no longer available. Please choose another start date.</p>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Today: {formatDisplayDate(today)}. Past dates and fully booked departures cannot be selected.
      </p>
    </div>
  );
}
