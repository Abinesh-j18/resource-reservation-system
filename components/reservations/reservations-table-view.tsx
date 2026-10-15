"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCcw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CancelReservationDialog } from "@/components/reservations/cancel-dialog";
import { formatDateTime, formatDate, formatTime } from "@/lib/utils";

interface ReservationsTableViewProps {
  reservations: any[];
}

export function ReservationsTableView({
  reservations,
}: ReservationsTableViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const filteredReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter((r) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(query);
        const matchesRes = r.resource.name.toLowerCase().includes(query);
        const matchesUser = r.user.name.toLowerCase().includes(query);
        if (!matchesTitle && !matchesRes && !matchesUser) return false;
      }

      // Status
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // Timeframe
      if (timeFilter === "UPCOMING") {
        if (new Date(r.endTime) < now) return false;
      } else if (timeFilter === "PAST") {
        if (new Date(r.endTime) >= now) return false;
      }

      return true;
    });
  }, [reservations, searchQuery, statusFilter, timeFilter]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search bookings, resource, user..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-36 bg-slate-50 border-slate-200 text-xs">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Time</SelectItem>
              <SelectItem value="UPCOMING">Upcoming Only</SelectItem>
              <SelectItem value="PAST">Past Bookings</SelectItem>
            </SelectContent>
          </Select>

          {(searchQuery || statusFilter !== "ALL" || timeFilter !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setTimeFilter("ALL");
              }}
              className="text-xs h-9 px-2 text-slate-500"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Reservation</TableHead>
              <TableHead className="font-semibold text-slate-700">Resource</TableHead>
              <TableHead className="font-semibold text-slate-700">Scheduled Time</TableHead>
              <TableHead className="font-semibold text-slate-700">Reserved By</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                  No reservations found matching the search and filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredReservations.map((res) => {
                const now = new Date();
                const isConfirmed = res.status === "CONFIRMED";
                const isPast = new Date(res.endTime) < now;

                return (
                  <TableRow key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Title & Purpose */}
                    <TableCell className="align-middle py-3.5">
                      <div className="font-semibold text-sm text-slate-900">
                        {res.title}
                      </div>
                      {res.purpose && (
                        <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                          {res.purpose}
                        </div>
                      )}
                    </TableCell>

                    {/* Resource & Location */}
                    <TableCell className="align-middle">
                      <div className="font-medium text-xs text-slate-800">
                        {res.resource.name}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{res.resource.location}</span>
                      </div>
                    </TableCell>

                    {/* Scheduled Time */}
                    <TableCell className="align-middle">
                      <div className="text-xs font-mono font-medium text-slate-800">
                        {formatDate(res.startTime)}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {formatTime(res.startTime)} &ndash; {formatTime(res.endTime)}
                      </div>
                    </TableCell>

                    {/* Reserved By */}
                    <TableCell className="align-middle">
                      <div className="text-xs font-medium text-slate-800">
                        {res.user.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {res.user.email}
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="align-middle">
                      {isConfirmed ? (
                        <Badge variant="success" className="gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 text-[11px] text-slate-500 bg-slate-100">
                          <XCircle className="h-3 w-3" />
                          Cancelled
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="align-middle text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDetails(res)}
                          className="h-8 px-2 text-xs text-slate-600 hover:text-slate-900"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Details
                        </Button>

                        {isConfirmed && !isPast && (
                          <CancelReservationDialog
                            reservationId={res.id}
                            reservationTitle={res.title}
                            resourceName={res.resource.name}
                            startTime={formatDateTime(res.startTime)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      {selectedDetails && (
        <Dialog open={!!selectedDetails} onOpenChange={() => setSelectedDetails(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedDetails.title}</DialogTitle>
              <DialogDescription>
                Detailed reservation record and resource specifications.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-lg border">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Resource:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDetails.resource.name} ({selectedDetails.resource.category?.name})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDetails.resource.location}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Capacity:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDetails.resource.capacity} People / Units
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Reserved By:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDetails.user.name} ({selectedDetails.user.email})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Time Window:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatDateTime(selectedDetails.startTime)} &ndash;{" "}
                  {formatTime(selectedDetails.endTime)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-semibold text-slate-900">
                  {selectedDetails.status}
                </span>
              </div>
              {selectedDetails.purpose && (
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Purpose / Notes:</span>
                  <p className="bg-white p-2 rounded border text-slate-800">
                    {selectedDetails.purpose}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
