import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDbConnectionError } from "@/lib/reservation-service";
import { demoStore } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        reservations: {
          include: { user: true },
          orderBy: { startTime: "asc" },
        },
      },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, error: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: resource });
  } catch (error: unknown) {
    if (isDbConnectionError(error)) {
      const mock = demoStore.resources.find((r) => r.id === params.id);
      if (mock) {
        return NextResponse.json({ success: true, data: mock });
      }
      return NextResponse.json(
        { success: false, error: "Resource not found" },
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
    const updated = await prisma.resource.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.capacity && { capacity: Number(body.capacity) }),
        ...(body.location && { location: body.location }),
        ...(body.status && { status: body.status }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.categoryId && { categoryId: body.categoryId }),
      },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: updated,
    });
  } catch (error: unknown) {
    if (isDbConnectionError(error)) {
      const idx = demoStore.resources.findIndex((r) => r.id === params.id);
      if (idx !== -1) {
        Object.assign(demoStore.resources[idx], await request.clone().json().catch(() => ({})));
        return NextResponse.json({
          success: true,
          message: "Resource updated successfully",
          data: demoStore.resources[idx],
        });
      }
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
    await prisma.resource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error: unknown) {
    if (isDbConnectionError(error)) {
      const idx = demoStore.resources.findIndex((r) => r.id === params.id);
      if (idx !== -1) {
        demoStore.resources.splice(idx, 1);
        return NextResponse.json({
          success: true,
          message: "Resource deleted successfully",
        });
      }
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
