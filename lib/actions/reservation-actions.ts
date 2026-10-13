"use server";

import { revalidatePath } from "next/cache";
import {
  createReservation,
  cancelReservation,
  deleteReservation,
  ConflictError,
  ValidationError,
  CreateReservationInput,
} from "@/lib/reservation-service";
import { reservationFormSchema } from "@/lib/validations";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isConflict?: boolean;
}

export async function createReservationAction(
  input: CreateReservationInput
): Promise<ActionResult> {
  try {
    const parsed = reservationFormSchema.safeParse({
      title: input.title,
      userId: input.userId,
      resourceId: input.resourceId,
      startTime:
        typeof input.startTime === "string"
          ? input.startTime
          : input.startTime.toISOString(),
      endTime:
        typeof input.endTime === "string"
          ? input.endTime
          : input.endTime.toISOString(),
      purpose: input.purpose || undefined,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0]?.message || "Invalid input data";
      return { success: false, error: issue };
    }

    const reservation = await createReservation(input);

    revalidatePath("/");
    revalidatePath("/reservations");
    revalidatePath("/schedule");
    revalidatePath("/resources");

    return { success: true, data: reservation };
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      return {
        success: false,
        error: error.message,
        isConflict: true,
      };
    }
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    const msg = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, error: msg };
  }
}

export async function cancelReservationAction(id: string): Promise<ActionResult> {
  try {
    const updated = await cancelReservation(id);

    revalidatePath("/");
    revalidatePath("/reservations");
    revalidatePath("/schedule");
    revalidatePath("/resources");

    return { success: true, data: updated };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to cancel reservation.";
    return { success: false, error: msg };
  }
}

export async function deleteReservationAction(id: string): Promise<ActionResult> {
  try {
    await deleteReservation(id);

    revalidatePath("/");
    revalidatePath("/reservations");
    revalidatePath("/schedule");
    revalidatePath("/resources");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete reservation.";
    return { success: false, error: msg };
  }
}
