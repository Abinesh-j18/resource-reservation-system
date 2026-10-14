import Link from "next/link";
import {
  CalendarDays,
  Layers,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { CancelReservationDialog } from "@/components/reservations/cancel-dialog";
import { formatDateTime } from "@/lib/utils";

interface QuickBookingProps {
  resources: any[];
  users: any[];
  upcomingReservations: any[];
}

export function QuickBooking({
  resources,
  users,
  upcomingReservations,
}: QuickBookingProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Upcoming Confirmed Bookings */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Upcoming Resource Bookings
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Next scheduled reservations across all organizational facilities
              </p>
            </div>
            <Link href="/reservations">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-700 hover:text-emerald-800 gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingReservations.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                <CalendarCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p>No upcoming reservations found.</p>
                <div className="mt-3">
                  <ReservationDialog
                    resources={resources}
                    users={users}
                    triggerButton={
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Create First Reservation
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingReservations.slice(0, 5).map((res) => (
                  <div
                    key={res.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/70 p-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {res.title}
                        </span>
                        <Badge variant="secondary" className="text-[10px] bg-slate-100">
                          {res.resource.name}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {formatDateTime(res.startTime)} &ndash;{" "}
                          {new Date(res.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {res.resource.location}
                        </span>
                        <span>
                          By: <strong className="text-slate-700">{res.user.name}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <CancelReservationDialog
                        reservationId={res.id}
                        reservationTitle={res.title}
                        resourceName={res.resource.name}
                        startTime={formatDateTime(res.startTime)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right 1 Col: Quick Actions & System Info */}
      <div className="space-y-4">
        {/* Quick Booking Action Card */}
        <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-emerald-950 font-semibold flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-emerald-600" />
              Quick Reservation
            </CardTitle>
            <p className="text-xs text-emerald-800">
              Instantly lock in meeting rooms, laboratory gear, or company vehicles.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ReservationDialog
              resources={resources}
              users={users}
              triggerButton={
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                  Book A Resource Now
                </Button>
              }
            />

            <div className="pt-2 border-t border-emerald-200/60 flex flex-col gap-2">
              <Link href="/schedule">
                <Button variant="outline" size="sm" className="w-full justify-between bg-white text-xs text-slate-700">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                    Open Schedule Timeline
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </Button>
              </Link>
              <Link href="/resources">
                <Button variant="outline" size="sm" className="w-full justify-between bg-white text-xs text-slate-700">
                  <span className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" />
                    Explore Resource Catalog
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* ACID Guarantee & Rules Card */}
        <Card className="border-slate-200 shadow-sm bg-slate-50/50">
          <CardContent className="p-4 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Concurrency &amp; Conflict Guarantee
            </div>
            <p className="text-[11px] leading-relaxed">
              Every booking is executed within an isolated database transaction:
            </p>
            <code className="block bg-white p-2 rounded border font-mono text-[10px] text-slate-700 leading-tight">
              existing.start &lt; newEnd AND existing.end &gt; newStart AND status != &apos;CANCELLED&apos;
            </code>
            <p className="text-[11px] text-slate-500">
              Overlapping slots return HTTP 409 Conflict with descriptive booking metadata.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
