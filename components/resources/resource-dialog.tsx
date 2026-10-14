"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, Loader2, Edit2, Layers } from "lucide-react";
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
import { resourceFormSchema, ResourceFormValues } from "@/lib/validations";
import {
  createResourceAction,
  updateResourceAction,
} from "@/lib/actions/resource-actions";

interface ResourceDialogProps {
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    name: string;
    categoryId: string;
    capacity: number;
    location: string;
    status: "AVAILABLE" | "MAINTENANCE";
    description?: string | null;
  };
  triggerButton?: React.ReactNode;
}

export function ResourceDialog({
  categories,
  initialData,
  triggerButton,
}: ResourceDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || categories[0]?.id || "",
      capacity: initialData?.capacity || 10,
      location: initialData?.location || "",
      status: initialData?.status || "AVAILABLE",
      description: initialData?.description || "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedStatus = watch("status");

  const onSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = isEditing
        ? await updateResourceAction(initialData.id, data)
        : await createResourceAction(data);

      if (!result.success) {
        setServerError(result.error || "Failed to save resource.");
      } else {
        if (!isEditing) reset();
        setOpen(false);
      }
    } catch {
      setServerError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <PlusCircle className="h-4 w-4" />
            <span>Add Resource</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Edit Resource" : "Create New Resource"}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update configuration, capacity, or location of this resource."
                  : "Register a shared facility or physical equipment for company reservation."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {serverError && (
          <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="res-name">Resource Name</Label>
            <Input
              id="res-name"
              placeholder="e.g. Orion Boardroom, Oscilloscope Rig 02"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-red-500 font-medium">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (Seats/Units)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-xs text-red-500 font-medium">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location / Station</Label>
              <Input
                id="location"
                placeholder="e.g. Building B, 3rd Floor"
                {...register("location")}
              />
              {errors.location && (
                <p className="text-xs text-red-500 font-medium">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Operational Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(val: "AVAILABLE" | "MAINTENANCE") =>
                  setValue("status", val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available for Booking</SelectItem>
                  <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-xs text-red-500 font-medium">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description &amp; Specifications</Label>
            <Textarea
              id="description"
              placeholder="e.g. 4K dual conference display, HDMI & wireless casting, 12 executive ergonomic chairs..."
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500 font-medium">{errors.description.message}</p>
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
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Resource"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
