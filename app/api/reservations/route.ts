import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createReservation,
  ConflictError,
  ValidationError,
} from "@/lib/reservation-service";
import { reservationFormSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(resourceId ? { resourceId } : {}),
        ...(userId ? { userId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        resource: {
          include: { category: true },
        },
        user: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({ success: true, data: reservations });
  } catch (error: unknown) {
    const { demoStore } = await import("@/lib/demo-data");
    const { isDbConnectionError } = await import("@/lib/reservation-service");
    if (isDbConnectionError(error)) {
      return NextResponse.json({ success: true, data: demoStore.getReservations() });
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reservationFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const reservation = await createReservation(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Reservation created successfully",
        data: reservation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          conflictingReservation: error.conflictingReservation,
        },
        { status: 409 }
      );
    }

    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: msg,
      },
      { status: 500 }
    );
  }
}
