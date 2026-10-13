import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  cancelReservation,
  updateReservation,
  deleteReservation,
  ConflictError,
  ValidationError,
  isDbConnectionError,
} from "@/lib/reservation-service";
import { demoStore } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        resource: { include: { category: true } },
        user: true,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: reservation });
  } catch (error: unknown) {
    if (isDbConnectionError(error)) {
      const mock = demoStore.reservations.find((r) => r.id === params.id);
      if (mock) {
        return NextResponse.json({ success: true, data: mock });
      }
      return NextResponse.json(
        { success: false, error: "Reservation not found" },
        { status: 404 }
      );
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (body.status === "CANCELLED") {
      const cancelled = await cancelReservation(params.id);
      return NextResponse.json({
        success: true,
        message: "Reservation cancelled successfully",
        data: cancelled,
      });
    }

    const updated = await updateReservation(params.id, body);
    return NextResponse.json({
      success: true,
      message: "Reservation updated successfully",
      data: updated,
    });
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
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteReservation(params.id);
    return NextResponse.json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error: unknown) {
    if (isDbConnectionError(error)) {
      demoStore.deleteReservation(params.id);
      return NextResponse.json({
        success: true,
        message: "Reservation deleted successfully",
      });
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
