import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resourceFormSchema } from "@/lib/validations";
import { ResourceStatus } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status");

    const resources = await prisma.resource.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(status ? { status: status as ResourceStatus } : {}),
      },
      include: {
        category: true,
        reservations: {
          where: {
            status: "CONFIRMED",
            endTime: { gte: new Date() },
          },
          orderBy: { startTime: "asc" },
          take: 5,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ success: true, data: resources });
  } catch (error: unknown) {
    const { demoStore } = await import("@/lib/demo-data");
    const { isDbConnectionError } = await import("@/lib/reservation-service");
    if (isDbConnectionError(error)) {
      return NextResponse.json({ success: true, data: demoStore.getResources() });
    }
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resourceFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        name: parsed.data.name,
        categoryId: parsed.data.categoryId,
        capacity: parsed.data.capacity,
        location: parsed.data.location,
        status: parsed.data.status as ResourceStatus,
        description: parsed.data.description || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
