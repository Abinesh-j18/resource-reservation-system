import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Users,
  Wrench,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { CancelReservationDialog } from "@/components/reservations/cancel-dialog";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ResourceDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ResourceDetailsPage({ params }: ResourceDetailsPageProps) {
  const { id } = params;

  let resource: any = null;
  let allResources: any[] = [];
  let allUsers: any[] = [];
  let allCategories: any[] = [];

  try {
    const [fetchedResource, fetchedResources, fetchedUsers, fetchedCategories] = await Promise.all([
      prisma.resource.findUnique({
        where: { id },
        include: {
          category: true,
          reservations: {
            include: {
              user: true,
            },
            orderBy: {
              startTime: "asc",
            },
          },
        },
      }),
      prisma.resource.findMany({ orderBy: { name: "asc" } }),
      prisma.user.findMany({ orderBy: { name: "asc" } }),
      prisma.resourceCategory.findMany({ orderBy: { name: "asc" } }),
    ]);

    resource = fetchedResource;
    allResources = fetchedResources;
    allUsers = fetchedUsers;
    allCategories = fetchedCategories;
  } catch (error) {
    const { demoStore } = await import("@/lib/demo-data");
    resource = demoStore.getResourceById(id);
    allResources = demoStore.getResources();
    allUsers = demoStore.getUsers();
    allCategories = demoStore.getCategories();
  }

  // Not Found State
  if (!resource) {
    return (
      <div className="container py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-4 rounded-full bg-slate-100 text-slate-400 w-16 h-16 mx-auto flex items-center justify-center">
          <Layers className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Resource Not Found</h1>
        <p className="text-sm text-slate-500">
          The requested resource ID does not exist or may have been removed.
        </p>
        <div className="pt-2">
          <Link href="/resources">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Resource Catalog</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isAvailable = resource.status === "AVAILABLE";
  const upcomingReservations = resource.reservations.filter(
    (r: any) => r.status === "CONFIRMED" && new Date(r.endTime) >= now
  );
  const pastReservations = resource.reservations.filter(
    (r: any) => new Date(r.endTime) < now || r.status === "CANCELLED"
  );

  const resourceOptions = allResources.map((r) => ({
    id: r.id,
    name: r.name,
    categoryName: r.category?.name,
    status: r.status,
    capacity: r.capacity,
  }));

  const userOptions = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="container py-8 space-y-8 max-w-6xl">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/resources"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Resource Catalog</span>
        </Link>
      </div>

      {/* Resource Header & Status */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
              {resource.category.name}
            </Badge>
            {isAvailable ? (
              <Badge variant="success" className="gap-1 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Available for Booking
              </Badge>
            ) : (
              <Badge variant="warning" className="gap-1 text-xs">
                <Wrench className="h-3.5 w-3.5" />
                Under Maintenance
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {resource.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-slate-400" />
              {resource.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-slate-400" />
              Capacity: <strong className="text-slate-700">{resource.capacity} people/units</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-slate-400" />
              Added {formatDate(resource.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <ResourceDialog
            categories={allCategories}
            initialData={resource}
            triggerButton={
              <Button variant="outline" size="sm" className="gap-1.5">
                Edit Resource
              </Button>
            }
          />
          <ReservationDialog
            resources={resourceOptions}
            users={userOptions}
            defaultResourceId={resource.id}
            triggerButton={
              <Button
                size="sm"
                disabled={!isAvailable}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Book This Resource</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Inactive Alert Banner (if MAINTENANCE) */}
      {!isAvailable && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3 text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Resource Currently Under Maintenance</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              This facility is currently inactive for repairs, servicing, or calibration. New reservation requests are automatically blocked by the conflict prevention engine until operational status is restored.
            </p>
          </div>
        </div>
      )}

      {/* Specifications & Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">About This Resource</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <p className="leading-relaxed">
              {resource.description || "No detailed technical description provided for this resource."}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Category</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {resource.category.name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Maximum Capacity</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {resource.capacity} Attendees
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {resource.location}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Summary Card */}
        <Card className="border-slate-200 bg-slate-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Schedule Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Upcoming Bookings:</span>
              <strong className="text-slate-900">{upcomingReservations.length}</strong>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Total Historical Bookings:</span>
              <strong className="text-slate-900">{resource.reservations.length}</strong>
            </div>
            <div className="pt-2">
              <Link href="/schedule">
                <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                  View in Timeline Schedule
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Related Upcoming Reservations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Upcoming Bookings for {resource.name}
          </h2>
          <span className="text-xs text-slate-500">
            {upcomingReservations.length} scheduled
          </span>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 p-6 space-y-2">
            <CalendarCheck className="h-8 w-8 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">No Upcoming Reservations</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              This resource currently has no active bookings. Time slots are open for scheduling.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {upcomingReservations.map((res: any) => (
              <div
                key={res.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{res.title}</span>
                    <Badge variant="success" className="text-[10px]">
                      Confirmed
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-[11px] text-slate-700">
                      {formatDateTime(res.startTime)} &ndash; {formatTime(res.endTime)}
                    </span>
                    <span>
                      Reserved by: <strong className="text-slate-800">{res.user.name}</strong> ({res.user.email})
                    </span>
                  </div>
                  {res.purpose && (
                    <p className="text-xs text-slate-600 pt-0.5">{res.purpose}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <CancelReservationDialog
                    reservationId={res.id}
                    reservationTitle={res.title}
                    resourceName={resource.name}
                    startTime={formatDateTime(res.startTime)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past / Cancelled History */}
      {pastReservations.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-semibold text-slate-700">
            Booking History &amp; Audit Trail ({pastReservations.length} past records)
          </h3>
          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200/60 overflow-hidden">
            {pastReservations.slice(0, 5).map((res: any) => (
              <div key={res.id} className="p-3 text-xs flex items-center justify-between gap-2 text-slate-600">
                <div className="space-y-0.5">
                  <span className="font-medium text-slate-800">{res.title}</span>
                  <div className="text-[11px] text-slate-400">
                    {formatDateTime(res.startTime)} &bull; {res.user.name}
                  </div>
                </div>
                <Badge
                  variant={res.status === "CONFIRMED" ? "secondary" : "outline"}
                  className="text-[10px]"
                >
                  {res.status === "CONFIRMED" ? "Completed" : "Cancelled"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
