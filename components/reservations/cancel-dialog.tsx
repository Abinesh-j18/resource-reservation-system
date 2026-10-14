"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cancelReservationAction } from "@/lib/actions/reservation-actions";

interface CancelDialogProps {
  reservationId: string;
  reservationTitle: string;
  resourceName: string;
  startTime: string;
}

export function CancelReservationDialog({
  reservationId,
  reservationTitle,
  resourceName,
  startTime,
}: CancelDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await cancelReservationAction(reservationId);
      if (!res.success) {
        setError(res.error || "Failed to cancel reservation.");
      } else {
        setOpen(false);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2.5">
          <Ban className="h-3.5 w-3.5 mr-1" />
          Cancel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Cancel Reservation?</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to cancel the reservation for{" "}
            <span className="font-semibold text-slate-800">&quot;{reservationTitle}&quot;</span> on{" "}
            <span className="font-semibold text-slate-800">{resourceName}</span> scheduled for{" "}
            <span className="font-semibold text-slate-800">{startTime}</span>?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded border border-red-200">
            {error}
          </div>
        )}

        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border">
          Cancelling will immediately release this time slot, allowing other team members to book the resource.
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Keep Reservation
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
