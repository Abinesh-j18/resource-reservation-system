import { prisma } from "@/lib/prisma";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { QuickBooking } from "@/components/dashboard/quick-booking";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, CalendarDays, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();

  // Start of today and end of today
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  let resources: any[] = [];
  let users: any[] = [];
  let upcomingReservations: any[] = [];
  let totalResources = 0;
  let activeResources = 0;
  let maintenanceResources = 0;
  let reservationsTodayCount = 0;
  let activeBookingsNowCount = 0;

  try {
    const [
      fetchedResources,
      fetchedUsers,
      fetchedUpcoming,
      todayCount,
      activeNowCount,
    ] = await Promise.all([
      prisma.resource.findMany({
        include: {
          category: true,
          reservations: {
            where: {
              status: "CONFIRMED",
              endTime: { gte: now },
            },
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.reservation.findMany({
        where: {
          status: "CONFIRMED",
          endTime: { gte: now },
        },
        include: {
          resource: { include: { category: true } },
          user: true,
        },
        orderBy: { startTime: "asc" },
        take: 8,
      }),
      prisma.reservation.count({
        where: {
          status: "CONFIRMED",
          startTime: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.reservation.count({
        where: {
          status: "CONFIRMED",
          startTime: { lte: now },
          endTime: { gte: now },
        },
      }),
    ]);

    resources = fetchedResources;
    users = fetchedUsers;
    upcomingReservations = fetchedUpcoming;
    totalResources = resources.length;
    activeResources = resources.filter((r) => r.status === "AVAILABLE").length;
    maintenanceResources = resources.filter((r) => r.status === "MAINTENANCE").length;
    reservationsTodayCount = todayCount;
    activeBookingsNowCount = activeNowCount;
  } catch (error) {
    // Graceful offline presentation fallback
    const { demoStore } = await import("@/lib/demo-data");
    const demoRes = demoStore.getResources();
    const demoUsers = demoStore.getUsers();
    const demoResv = demoStore.getReservations();

    resources = demoRes;
    users = demoUsers;
    upcomingReservations = demoResv.filter((r) => r.status === "CONFIRMED" && new Date(r.endTime) >= now);
    totalResources = demoRes.length;
    activeResources = demoRes.filter((r) => r.status === "AVAILABLE").length;
    maintenanceResources = demoRes.filter((r) => r.status === "MAINTENANCE").length;
    reservationsTodayCount = demoResv.filter(
      (r) => r.status === "CONFIRMED" && new Date(r.startTime) >= startOfToday && new Date(r.startTime) <= endOfToday
    ).length;
    activeBookingsNowCount = demoResv.filter(
      (r) => r.status === "CONFIRMED" && new Date(r.startTime) <= now && new Date(r.endTime) >= now
    ).length;
  }

  // Format resource options for select dropdown
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
    <div className="container py-8 space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Live Resource Availability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Resource Reservation Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Monitor facilities, prevent overlapping schedule conflicts, and coordinate shared organizational resources in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ReservationDialog
            resources={resourceOptions}
            users={userOptions}
            triggerButton={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm font-medium">
                <PlusCircle className="h-4 w-4" />
                <span>New Reservation</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* High-level KPIs */}
      <KpiCards
        totalResources={totalResources}
        activeResources={activeResources}
        maintenanceResources={maintenanceResources}
        reservationsToday={reservationsTodayCount}
        upcomingReservations={upcomingReservations.length}
        activeBookingsNow={activeBookingsNowCount}
      />

      {/* Main Section: Quick Booking & Upcoming Reservatons */}
      <QuickBooking
        resources={resourceOptions}
        users={userOptions}
        upcomingReservations={upcomingReservations}
      />
    </div>
  );
}
