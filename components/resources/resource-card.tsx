"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  CalendarCheck,
  Edit2,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReservationDialog } from "@/components/reservations/reservation-dialog";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { toggleResourceStatusAction } from "@/lib/actions/resource-actions";

interface ResourceCardProps {
  resource: {
    id: string;
    name: string;
    capacity: number;
    location: string;
    status: "AVAILABLE" | "MAINTENANCE";
    description?: string | null;
    categoryId: string;
    category: {
      id: string;
      name: string;
    };
    reservations?: {
      id: string;
      title: string;
      startTime: Date | string;
      endTime: Date | string;
      status: string;
    }[];
  };
  categories: { id: string; name: string }[];
  allResources: { id: string; name: string; status: "AVAILABLE" | "MAINTENANCE"; capacity: number }[];
  allUsers: { id: string; name: string; email: string; role: string }[];
}

export function ResourceCard({
  resource,
  categories,
  allResources,
  allUsers,
}: ResourceCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const isAvailable = resource.status === "AVAILABLE";

  // Check if currently occupied right this second
  const now = new Date();
  const currentBooking = resource.reservations?.find((r) => {
    if (r.status === "CANCELLED") return false;
    const start = new Date(r.startTime);
    const end = new Date(r.endTime);
    return now >= start && now <= end;
  });

  const nextBooking = resource.reservations?.find((r) => {
    if (r.status === "CANCELLED") return false;
    const start = new Date(r.startTime);
    return start > now;
  });

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const nextStatus = isAvailable ? "MAINTENANCE" : "AVAILABLE";
      await toggleResourceStatusAction(resource.id, nextStatus);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-all border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
            {resource.category.name}
          </Badge>
          <div className="flex items-center gap-1.5">
            {resource.status === "MAINTENANCE" ? (
              <Badge variant="warning" className="gap-1 text-[11px]">
                <Wrench className="h-3 w-3" />
                Under Maintenance
              </Badge>
            ) : currentBooking ? (
              <Badge variant="destructive" className="gap-1 text-[11px]">
                <Clock className="h-3 w-3" />
                In Use
              </Badge>
            ) : (
              <Badge variant="success" className="gap-1 text-[11px]">
                <CheckCircle2 className="h-3 w-3" />
                Available Now
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-2">
          <Link
            href={`/resources/${resource.id}`}
            className="font-bold text-lg text-slate-900 tracking-tight leading-snug hover:text-emerald-700 transition-colors inline-flex items-center gap-1 group"
          >
            <span>{resource.name}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
            {resource.description || "No specific resource notes provided."}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4 flex-1">
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Cap: <strong className="text-slate-800">{resource.capacity}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate" title={resource.location}>
              {resource.location}
            </span>
          </div>
        </div>

        {/* Live Slot Status */}
        <div className="text-xs space-y-1">
          {currentBooking ? (
            <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
              <span className="font-semibold block truncate">Current: {currentBooking.title}</span>
              <span className="text-[11px] text-amber-700">
                Until {new Date(currentBooking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : nextBooking ? (
            <div className="p-2 rounded bg-slate-50 border text-slate-700">
              <span className="text-[11px] text-slate-500 block">Next upcoming:</span>
              <span className="font-medium truncate block">{nextBooking.title}</span>
              <span className="text-[10px] text-slate-500">
                {new Date(nextBooking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ) : (
            <div className="p-2 rounded bg-emerald-50/60 border border-emerald-100 text-emerald-800 text-[11px]">
              No pending reservations today. Open for booking.
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Admin edit dialog */}
          <ResourceDialog
            categories={categories}
            initialData={resource}
            triggerButton={
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900" title="Edit Resource">
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            }
          />
          {/* Toggle Maintenance button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isToggling}
            className="text-[11px] h-8 px-2 text-slate-600 hover:text-slate-900"
            title="Toggle Maintenance State"
          >
            <Wrench className="h-3 w-3 mr-1" />
            {isAvailable ? "Set Maint." : "Set Active"}
          </Button>
        </div>

        {/* Book Now Button */}
        <ReservationDialog
          resources={allResources}
          users={allUsers}
          defaultResourceId={resource.id}
          triggerButton={
            <Button
              size="sm"
              disabled={!isAvailable}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs gap-1.5 shadow-sm"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Book
            </Button>
          }
        />
      </CardFooter>
    </Card>
  );
}
