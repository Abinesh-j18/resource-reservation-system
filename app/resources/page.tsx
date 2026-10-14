import { prisma } from "@/lib/prisma";
import { ResourceCatalogView } from "@/components/resources/resource-catalog-view";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  let resources: any[] = [];
  let categories: any[] = [];
  let users: any[] = [];

  try {
    const [fetchedResources, fetchedCategories, fetchedUsers] = await Promise.all([
      prisma.resource.findMany({
        include: {
          category: true,
          reservations: {
            where: {
              status: "CONFIRMED",
            },
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.resourceCategory.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    resources = fetchedResources;
    categories = fetchedCategories;
    users = fetchedUsers;
  } catch (error) {
    const { demoStore } = await import("@/lib/demo-data");
    resources = demoStore.getResources();
    categories = demoStore.getCategories();
    users = demoStore.getUsers();
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              Inventory &amp; Assets
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Shared Physical Facilities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Resource Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Browse and filter all organization facilities, testing rigs, AV equipment, and company fleet vehicles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ResourceDialog
            categories={categories}
            triggerButton={
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
                <PlusCircle className="h-4 w-4" />
                <span>Add Resource</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* Catalog View */}
      <ResourceCatalogView
        resources={resources}
        categories={categories}
        users={users}
      />
    </div>
  );
}
