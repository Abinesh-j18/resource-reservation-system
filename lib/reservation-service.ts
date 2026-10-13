import { prisma } from "@/lib/prisma";
import { ReservationStatus, ResourceStatus } from "@/lib/types";

export class ConflictError extends Error {
  statusCode: number;
  conflictingReservation?: {
    id: string;
    title: string;
    userName: string;
    startTime: Date;
    endTime: Date;
  };

  constructor(
    message: string,
    conflictingReservation?: {
      id: string;
      title: string;
      userName: string;
      startTime: Date;
      endTime: Date;
    }
  ) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
    this.conflictingReservation = conflictingReservation;
  }
}

export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

export interface CreateReservationInput {
  title: string;
  userId: string;
  resourceId: string;
  startTime: Date | string;
  endTime: Date | string;
  purpose?: string | null;
}

export interface UpdateReservationInput {
  title?: string;
  resourceId?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  purpose?: string | null;
  status?: ReservationStatus;
}

/**
 * Overlap check logic per assessment brief:
 *   existing.startTime < newEndTime AND existing.endTime > newStartTime
 */
export function checkIntervalOverlap(
  existingStart: Date | string,
  existingEnd: Date | string,
  newStart: Date | string,
  newEnd: Date | string
): boolean {
  const eStart = new Date(existingStart).getTime();
  const eEnd = new Date(existingEnd).getTime();
  const nStart = new Date(newStart).getTime();
  const nEnd = new Date(newEnd).getTime();

  return eStart < nEnd && eEnd > nStart;
}

/**
 * Validates reservation time bounds and ensures end time is after start time.
 */
export function validateTimeRange(start: Date, end: Date) {
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError("Invalid date/time format provided.");
  }

  if (start >= end) {
    throw new ValidationError("Reservation end time must be strictly after start time.");
  }

  const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
  if (durationMinutes < 15) {
    throw new ValidationError("Reservations must be at least 15 minutes in duration.");
  }

  if (durationMinutes > 24 * 60) {
    throw new ValidationError("Single reservations cannot exceed 24 continuous hours.");
  }
}

import { demoStore } from "@/lib/demo-data";

export function isDbConnectionError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes("can't reach database server") ||
      msg.includes("connection refused") ||
      msg.includes("timed out") ||
      msg.includes("database system is starting up") ||
      msg.includes("p1001") ||
      msg.includes("p1002")
    );
  }
  return false;
}

/**
 * Creates a new reservation using an atomic database transaction to prevent double bookings.
 * Overlap check logic:
 *   existing.startTime < newEndTime AND existing.endTime > newStartTime AND existing.status != 'CANCELLED'
 */
export async function createReservation(input: CreateReservationInput) {
  const newStartTime = new Date(input.startTime);
  const newEndTime = new Date(input.endTime);

  validateTimeRange(newStartTime, newEndTime);

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if resource exists and is available
      const resource = await tx.resource.findUnique({
        where: { id: input.resourceId },
      });

      if (!resource) {
        throw new ValidationError("Selected resource was not found.");
      }

      if (resource.status === ResourceStatus.MAINTENANCE) {
        throw new ValidationError(
          `Cannot book "${resource.name}" because it is currently under scheduled maintenance.`
        );
      }

      // 2. Check if user exists
      const user = await tx.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new ValidationError("Selected user account was not found.");
      }

      // 3. Strict conflict detection query inside transaction
      // Overlapping condition: existing.startTime < newEndTime AND existing.endTime > newStartTime
      const conflictingReservation = await tx.reservation.findFirst({
        where: {
          resourceId: input.resourceId,
          status: { not: ReservationStatus.CANCELLED },
          startTime: { lt: newEndTime },
          endTime: { gt: newStartTime },
        },
        include: {
          user: true,
        },
      });

      if (conflictingReservation) {
        const conflictMsg = `Scheduling conflict: "${resource.name}" is already reserved for "${
          conflictingReservation.title
        }" by ${conflictingReservation.user.name} from ${conflictingReservation.startTime.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit" }
        )} to ${conflictingReservation.endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}.`;

        throw new ConflictError(conflictMsg, {
          id: conflictingReservation.id,
          title: conflictingReservation.title,
          userName: conflictingReservation.user.name,
          startTime: conflictingReservation.startTime,
          endTime: conflictingReservation.endTime,
        });
      }

      // 4. Safe insertion
      return await tx.reservation.create({
        data: {
          title: input.title,
          userId: input.userId,
          resourceId: input.resourceId,
          startTime: newStartTime,
          endTime: newEndTime,
          purpose: input.purpose || null,
          status: ReservationStatus.CONFIRMED,
        },
        include: {
          resource: {
            include: {
              category: true,
            },
          },
          user: true,
        },
      });
    });
  } catch (err: unknown) {
    if (err instanceof ConflictError || err instanceof ValidationError) {
      throw err;
    }

    if (isDbConnectionError(err)) {
      // In offline presentation mode, run strict conflict detection on demoStore
      const resource = demoStore.resources.find((r) => r.id === input.resourceId);
      if (!resource) {
        throw new ValidationError("Selected resource was not found.");
      }

      if (resource.status === ResourceStatus.MAINTENANCE) {
        throw new ValidationError(
          `Cannot book "${resource.name}" because it is currently under scheduled maintenance.`
        );
      }

      const conflicting = demoStore.reservations.find((r) => {
        if (r.resourceId !== input.resourceId) return false;
        if (r.status === ReservationStatus.CANCELLED) return false;
        return checkIntervalOverlap(r.startTime, r.endTime, newStartTime, newEndTime);
      });

      if (conflicting) {
        const conflictMsg = `Scheduling conflict: "${resource.name}" is already reserved for "${
          conflicting.title
        }" by ${conflicting.user.name} from ${conflicting.startTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} to ${conflicting.endTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}.`;

        throw new ConflictError(conflictMsg, {
          id: conflicting.id,
          title: conflicting.title,
          userName: conflicting.user.name,
          startTime: conflicting.startTime,
          endTime: conflicting.endTime,
        });
      }

      return demoStore.createReservation({
        title: input.title,
        userId: input.userId,
        resourceId: input.resourceId,
        startTime: newStartTime,
        endTime: newEndTime,
        purpose: input.purpose,
      });
    }

    throw err;
  }
}

/**
 * Updates an existing reservation with atomic conflict prevention.
 */
export async function updateReservation(id: string, input: UpdateReservationInput) {
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!existing) {
      throw new ValidationError("Reservation not found.");
    }

    const targetResourceId = input.resourceId || existing.resourceId;
    const targetStartTime = input.startTime ? new Date(input.startTime) : existing.startTime;
    const targetEndTime = input.endTime ? new Date(input.endTime) : existing.endTime;

    if (input.startTime || input.endTime) {
      validateTimeRange(targetStartTime, targetEndTime);
    }

    // If changing to or already non-cancelled, ensure no conflicts
    const nextStatus = input.status || existing.status;
    if (nextStatus !== ReservationStatus.CANCELLED) {
      const conflict = await tx.reservation.findFirst({
        where: {
          id: { not: id },
          resourceId: targetResourceId,
          status: { not: ReservationStatus.CANCELLED },
          startTime: { lt: targetEndTime },
          endTime: { gt: targetStartTime },
        },
        include: { user: true },
      });

      if (conflict) {
        throw new ConflictError(
          `Conflict: Resource already reserved by ${conflict.user.name} between ${conflict.startTime.toLocaleTimeString()} and ${conflict.endTime.toLocaleTimeString()}.`
        );
      }
    }

    return await tx.reservation.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.resourceId && { resourceId: input.resourceId }),
        ...(input.startTime && { startTime: targetStartTime }),
        ...(input.endTime && { endTime: targetEndTime }),
        ...(input.purpose !== undefined && { purpose: input.purpose }),
        ...(input.status && { status: input.status }),
      },
      include: {
        resource: { include: { category: true } },
        user: true,
      },
    });
  });
}

/**
 * Cancels a reservation by ID.
 */
export async function cancelReservation(id: string) {
  try {
    return await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
      include: {
        resource: true,
        user: true,
      },
    });
  } catch (err: unknown) {
    if (isDbConnectionError(err)) {
      const cancelled = demoStore.cancelReservation(id);
      if (cancelled) return cancelled;
    }
    throw err;
  }
}

/**
 * Deletes a reservation by ID.
 */
export async function deleteReservation(id: string) {
  return await prisma.reservation.delete({
    where: { id },
  });
}
