"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { resourceFormSchema, ResourceFormValues } from "@/lib/validations";
import { ResourceStatus } from "@/lib/types";
import { demoStore } from "@/lib/demo-data";
import { isDbConnectionError } from "@/lib/reservation-service";

export interface ResourceActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createResourceAction(
  values: ResourceFormValues
): Promise<ResourceActionResult> {
  try {
    const parsed = resourceFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    try {
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

      revalidatePath("/resources");
      revalidatePath("/schedule");
      revalidatePath("/");

      return { success: true, data: resource };
    } catch (dbErr) {
      if (isDbConnectionError(dbErr)) {
        const resource = demoStore.createResource({
          name: parsed.data.name,
          categoryId: parsed.data.categoryId,
          capacity: parsed.data.capacity,
          location: parsed.data.location,
          status: parsed.data.status as ResourceStatus,
          description: parsed.data.description,
        });

        revalidatePath("/resources");
        revalidatePath("/schedule");
        revalidatePath("/");

        return { success: true, data: resource };
      }
      throw dbErr;
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create resource.";
    return { success: false, error: msg };
  }
}

export async function updateResourceAction(
  id: string,
  values: ResourceFormValues
): Promise<ResourceActionResult> {
  try {
    const parsed = resourceFormSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message };
    }

    try {
      const updated = await prisma.resource.update({
        where: { id },
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

      revalidatePath("/resources");
      revalidatePath("/schedule");
      revalidatePath("/");

      return { success: true, data: updated };
    } catch (dbErr) {
      if (isDbConnectionError(dbErr)) {
        const updated = demoStore.updateResource(id, {
          name: parsed.data.name,
          categoryId: parsed.data.categoryId,
          capacity: parsed.data.capacity,
          location: parsed.data.location,
          status: parsed.data.status as ResourceStatus,
          description: parsed.data.description,
        });

        revalidatePath("/resources");
        revalidatePath("/schedule");
        revalidatePath("/");

        return { success: true, data: updated };
      }
      throw dbErr;
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update resource.";
    return { success: false, error: msg };
  }
}

export async function toggleResourceStatusAction(
  id: string,
  status: ResourceStatus
): Promise<ResourceActionResult> {
  try {
    try {
      const updated = await prisma.resource.update({
        where: { id },
        data: { status },
        include: { category: true },
      });

      revalidatePath("/resources");
      revalidatePath("/schedule");
      revalidatePath("/");

      return { success: true, data: updated };
    } catch (dbErr) {
      if (isDbConnectionError(dbErr)) {
        const updated = demoStore.toggleResourceStatus(id, status);

        revalidatePath("/resources");
        revalidatePath("/schedule");
        revalidatePath("/");

        return { success: true, data: updated };
      }
      throw dbErr;
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to toggle status.";
    return { success: false, error: msg };
  }
}

export async function deleteResourceAction(id: string): Promise<ResourceActionResult> {
  try {
    try {
      await prisma.resource.delete({
        where: { id },
      });
    } catch (dbErr) {
      if (!isDbConnectionError(dbErr)) {
        throw dbErr;
      }
    }

    revalidatePath("/resources");
    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete resource.";
    return { success: false, error: msg };
  }
}
