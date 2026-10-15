"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CalendarPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ReservationFormProps {
  resources: ResourceOption[];
  users: UserOption[];
  defaultResourceId?: string;
  onSuccessRedirect?: string;
}

export function ReservationForm({
  resources,
  users,
  defaultResourceId,
  onSuccessRedirect = "/reservations",
}: ReservationFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Default times: next full hour for 1 hour duration
  const getDefaultTimes = () => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);

    const start = new Date(now);
    const end = new Date(now);
    end.setHours(end.getHours() + 1);

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
        setIsSuccess(true);
        setTimeout(() => {
          router.push(onSuccessRedirect);
        }, 1200);
      }
    } catch {
      setServerError("An unexpected error occurred while communicating with the server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50 p-8 text-center space-y-3">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-emerald-950">Reservation Confirmed!</h3>
        <p className="text-xs text-emerald-800">
          Your booking has been saved to PostgreSQL. Redirecting to reservations overview...
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-sm max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Create New Reservation</CardTitle>
            <CardDescription>
              Select a resource, specify the booking time window, and reserve without schedule conflicts.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {serverError && (
          <div className="mb-4">
            <ConflictAlert error={serverError} isConflict={isConflict} />
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-title">Reservation Title</Label>
            <Input
              id="new-title"
              placeholder="e.g. Sprint Architecture Sync, Lab Test Session"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-resource">Resource</Label>
              <Select
                value={selectedResourceId}
                onValueChange={(val) => setValue("resourceId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="new-resource">
                  <SelectValue placeholder="Select resource" />
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
              <Label htmlFor="new-user">Reserved By (User)</Label>
              <Select
                value={selectedUserId}
                onValueChange={(val) => setValue("userId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="new-user">
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
              <Label htmlFor="new-start">Start Date &amp; Time</Label>
              <Input
                id="new-start"
                type="datetime-local"
                {...register("startTime")}
              />
              {errors.startTime && (
                <p className="text-xs text-red-500 font-medium">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-end">End Date &amp; Time</Label>
              <Input
                id="new-end"
                type="datetime-local"
                {...register("endTime")}
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 font-medium">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-purpose">Purpose / Notes (Optional)</Label>
            <Textarea
              id="new-purpose"
              placeholder="Provide agenda, required equipment setup, or attendee list..."
              rows={3}
              {...register("purpose")}
            />
            {errors.purpose && (
              <p className="text-xs text-red-500 font-medium">{errors.purpose.message}</p>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
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
                  Checking Conflict Rules...
                </>
              ) : (
                "Confirm Reservation"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
