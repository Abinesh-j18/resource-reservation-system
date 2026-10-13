import { z } from "zod";

export const reservationFormSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title cannot exceed 100 characters"),
    userId: z.string().min(1, "Please select a user"),
    resourceId: z.string().min(1, "Please select a resource"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    purpose: z.string().max(500, "Purpose cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

export const resourceFormSchema = z.object({
  name: z
    .string()
    .min(2, "Resource name must be at least 2 characters")
    .max(80, "Resource name cannot exceed 80 characters"),
  categoryId: z.string().min(1, "Category is required"),
  capacity: z.coerce
    .number()
    .int("Capacity must be an integer")
    .min(1, "Capacity must be at least 1")
    .max(5000, "Capacity cannot exceed 5000"),
  location: z
    .string()
    .min(2, "Location is required")
    .max(120, "Location cannot exceed 120 characters"),
  status: z.enum(["AVAILABLE", "MAINTENANCE"], {
    required_error: "Status is required",
  }),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
});

export type ResourceFormValues = z.infer<typeof resourceFormSchema>;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(60, "Category name cannot exceed 60 characters"),
  description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;
