"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Loader2, CalendarPlus } from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reservationFormSchema, ReservationFormValues } from "@/lib/validations";
import { createReservationAction } from "@/lib/actions/reservation-actions";
import { ConflictAlert } from "./conflict-alert";

interface ResourceOption {
  id: string;
  name: string;
  categoryName?: string;
  status: "AVAILABLE" | "MAINTENANCE";
  capacity: number;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ReservationDialogProps {
  resources: ResourceOption[];
  users: UserOption[];
  defaultResourceId?: string;
  triggerButton?: React.ReactNode;
}

export function ReservationDialog({
  resources,
  users,
  defaultResourceId,
  triggerButton,
}: ReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default times: next full hour for 1 hour duration
  const getDefaultTimes = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);

    const start = new Date(now);
    const end = new Date(now);
    end.setHours(end.getHours() + 1);

    // Format to YYYY-MM-DDTHH:mm for datetime-local
    const formatLocal = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return {
      startTime: formatLocal(start),
      endTime: formatLocal(end),
    };
  };

  const initialTimes = getDefaultTimes();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema),
    defaultValues: {
      title: "",
      userId: users[0]?.id || "",
      resourceId: defaultResourceId || resources[0]?.id || "",
      startTime: initialTimes.startTime,
      endTime: initialTimes.endTime,
      purpose: "",
    },
  });

  const selectedResourceId = watch("resourceId");
  const selectedUserId = watch("userId");

  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    setIsConflict(false);

    try {
      const result = await createReservationAction({
        title: data.title,
        userId: data.userId,
        resourceId: data.resourceId,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        purpose: data.purpose,
      });

      if (!result.success) {
        setServerError(result.error || "Failed to create reservation");
        setIsConflict(!!result.isConflict);
      } else {
        // Reset form and close modal
        reset();
        setOpen(false);
      }
    } catch (err: unknown) {
      setServerError("An unexpected client error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
            <PlusCircle className="h-4 w-4" />
            <span>New Reservation</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Reserve a Resource</DialogTitle>
              <DialogDescription>
                Schedule an exclusive reservation. Double bookings are automatically prevented.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="my-2">
            <ConflictAlert error={serverError} isConflict={isConflict} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Reservation Title</Label>
            <Input
              id="title"
              placeholder="e.g. Q4 Executive Strategy Sync, Sprint Review"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="resourceId">Resource to Book</Label>
              <Select
                value={selectedResourceId}
                onValueChange={(val) => setValue("resourceId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="resourceId">
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((res) => (
                    <SelectItem
                      key={res.id}
                      value={res.id}
                      disabled={res.status === "MAINTENANCE"}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span>{res.name}</span>
                        {res.status === "MAINTENANCE" && (
                          <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">
                            (Maintenance)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.resourceId && (
                <p className="text-xs text-red-500 font-medium">{errors.resourceId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userId">Reserved By (User)</Label>
              <Select
                value={selectedUserId}
                onValueChange={(val) => setValue("userId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="userId">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-xs text-red-500 font-medium">{errors.userId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Date &amp; Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="text-xs text-red-500 font-medium">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime">End Date &amp; Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register("endTime")}
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 font-medium">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose / Agenda (Optional)</Label>
            <Textarea
              id="purpose"
              placeholder="Provide context, required equipment setup, or attendee details..."
              rows={3}
              {...register("purpose")}
            />
            {errors.purpose && (
              <p className="text-xs text-red-500 font-medium">{errors.purpose.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking Availability...
                </>
              ) : (
                "Confirm Reservation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
