"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User as UserIcon,
  Wrench,
  CheckCircle2,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";

interface TimelineReservation {
  id: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  status: string;
  purpose?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface TimelineResource {
  id: string;
  name: string;
  capacity: number;
  location: string;
  status: "AVAILABLE" | "MAINTENANCE";
  category: {
    id: string;
    name: string;
  };
  reservations: TimelineReservation[];
}

interface TimelineViewProps {
  resources: TimelineResource[];
  allUsers: { id: string; name: string; email: string; role: string }[];
}

export function TimelineView({ resources, allUsers }: TimelineViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  // Working hours: 08:00 to 20:00 (12 hours)
  const startHour = 8;
  const endHour = 20;
  const totalHours = endHour - startHour;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  // Navigate dates
  const handlePrevDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() - 1);
    setSelectedDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setSelectedDate(d);
  };

  // Filter resources
  const filteredResources = resources.filter((res) => {
    if (activeCategory !== "ALL" && res.category.id !== activeCategory) {
      return false;
    }
    return true;
  });

  // Extract unique categories
  const categories = Array.from(
    new Map(resources.map((r) => [r.category.id, r.category])).values()
  );

  // Helper to calculate left % and width % for a reservation on this selected date
  const getSlotPosition = (startTimeStr: Date | string, endTimeStr: Date | string) => {
    const start = new Date(startTimeStr);
    const end = new Date(endTimeStr);

    const dayStart = new Date(selectedDate);
    dayStart.setHours(startHour, 0, 0, 0);

    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(endHour, 0, 0, 0);

    // If completely outside day range
    if (end <= dayStart || start >= dayEnd) {
      return null;
    }

    const clampedStart = Math.max(start.getTime(), dayStart.getTime());
    const clampedEnd = Math.min(end.getTime(), dayEnd.getTime());

    const totalWindowMs = totalHours * 60 * 60 * 1000;
    const leftMs = clampedStart - dayStart.getTime();
    const durationMs = clampedEnd - clampedStart;

    const left = (leftMs / totalWindowMs) * 100;
    const width = Math.max((durationMs / totalWindowMs) * 100, 3); // min 3% width for visibility

    return { left, width, originalStart: start, originalEnd: end };
  };

  const dateStr = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Date Header Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevDay} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs font-medium">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextDay} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-slate-800 text-sm sm:text-base">
              {dateStr}
            </span>
          </div>
        </div>

        {/* Category Pills & Legend */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === "ALL"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Resources ({resources.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeCategory === c.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-600 px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-600 inline-block" />
          <span>Confirmed Reservation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-amber-400 inline-block" />
          <span>Maintenance Mode</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-slate-100 border border-slate-300 inline-block" />
          <span>Available Slot</span>
        </div>
      </div>

      {/* Visual Timeline Grid Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Header Hour Markers */}
          <div className="grid grid-cols-[220px_1fr] border-b bg-slate-50 text-xs font-semibold text-slate-600">
            <div className="p-3 border-r">Resource / Facility</div>
            <div className="relative flex justify-between px-2 py-3 text-[11px] text-slate-500">
              {hours.map((hour) => (
                <div key={hour} className="text-center font-mono">
                  {hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
              ))}
            </div>
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-slate-100">
            {filteredResources.map((res) => {
              const isMaintenance = res.status === "MAINTENANCE";

              // Find reservations occurring on this date
              const dayReservations = res.reservations.filter((r) => r.status !== "CANCELLED");

              return (
                <div
                  key={res.id}
                  className="grid grid-cols-[220px_1fr] hover:bg-slate-50/60 transition-colors group"
                >
                  {/* Left Column: Resource Metadata & Quick Action */}
                  <div className="p-3 border-r flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {res.name}
                        </span>
                        {isMaintenance ? (
                          <Wrench className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="truncate">{res.category.name}</span>
                        <span>&bull;</span>
                        <span>Cap: {res.capacity}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <ReservationDialog
                        resources={resources}
                        users={allUsers}
                        defaultResourceId={res.id}
                        triggerButton={
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isMaintenance}
                            className="h-6 px-2 text-[11px] text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 w-full justify-start gap-1"
                          >
                            <CalendarPlus className="h-3 w-3" />
                            Book Slot
                          </Button>
                        }
                      />
                    </div>
                  </div>

                  {/* Right Column: Interactive Schedule Timeline Bar */}
                  <div className="relative h-20 bg-slate-50/30 overflow-hidden flex items-center px-1">
                    {/* Hourly grid lines */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="h-full border-r border-slate-100 border-dashed"
                          style={{ width: `${100 / totalHours}%` }}
                        />
                      ))}
                    </div>

                    {/* Maintenance Overlay if inactive */}
                    {isMaintenance ? (
                      <div className="absolute inset-x-2 inset-y-2 rounded bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center gap-2 text-xs font-medium pattern-stripes">
                        <Wrench className="h-4 w-4 text-amber-600" />
                        <span>Under Scheduled Maintenance &mdash; Bookings Locked</span>
                      </div>
                    ) : (
                      <>
                        {/* Booked Slots Rendered as Blocks */}
                        {dayReservations.map((booking) => {
                          const pos = getSlotPosition(booking.startTime, booking.endTime);
                          if (!pos) return null;

                          return (
                            <div
                              key={booking.id}
                              className="absolute top-2 bottom-2 rounded-md bg-emerald-600 text-white shadow-sm border border-emerald-700/40 p-1.5 text-xs overflow-hidden hover:z-20 hover:scale-[1.01] hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer group/slot"
                              style={{
                                left: `${pos.left}%`,
                                width: `${pos.width}%`,
                              }}
                              title={`${booking.title}\nBy: ${booking.user.name}\n${pos.originalStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${pos.originalEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}\n${booking.purpose || ""}`}
                            >
                              <div className="flex flex-col h-full justify-between leading-tight">
                                <span className="font-bold truncate text-[11px]">
                                  {booking.title}
                                </span>
                                <div className="flex items-center justify-between text-[10px] text-emerald-100 opacity-90 truncate">
                                  <span className="truncate">{booking.user.name}</span>
                                  <span className="font-mono text-[9px] ml-1">
                                    {pos.originalStart.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredResources.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No resources found matching this category filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
