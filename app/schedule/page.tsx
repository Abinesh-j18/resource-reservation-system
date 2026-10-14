import { prisma } from "@/lib/prisma";
import { TimelineView } from "@/components/schedule/timeline-view";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  let resources: any[] = [];
  let users: any[] = [];

  try {
    const [fetchedResources, fetchedUsers] = await Promise.all([
      prisma.resource.findMany({
        include: {
          category: true,
          reservations: {
            where: {
              status: { not: "CANCELLED" },
            },
            include: {
              user: true,
            },
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    resources = fetchedResources;
    users = fetchedUsers;
  } catch (error) {
    const { demoStore } = await import("@/lib/demo-data");
    resources = demoStore.getResources();
    users = demoStore.getUsers();
  }

  const resourceOptions = resources.map((r) => ({
    id: r.id,
    name: r.name,
    categoryName: r.category?.name,
    status: r.status,
    capacity: r.capacity,
  }));

  const userOptions = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="container py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Interactive Schedule
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Timeline &amp; Availability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Resource Timeline View
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Inspect hour-by-hour reservations, identify open gaps, and ensure zero overlapping bookings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReservationDialog
            resources={resourceOptions}
            users={userOptions}
            triggerButton={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                <span>New Reservation</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Interactive Visual Timeline */}
      <TimelineView resources={resources} allUsers={userOptions} />
    </div>
  );
}
