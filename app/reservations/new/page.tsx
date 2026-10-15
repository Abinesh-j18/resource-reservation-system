import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { ReservationForm } from "@/components/reservations/reservation-form";

export const dynamic = "force-dynamic";

interface NewReservationPageProps {
  searchParams?: {
    resourceId?: string;
  };
}

export default async function NewReservationPage({ searchParams }: NewReservationPageProps) {
  let resources: any[] = [];
  let users: any[] = [];

  try {
    const [fetchedResources, fetchedUsers] = await Promise.all([
      prisma.resource.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    resources = fetchedResources;
    users = fetchedUsers;
  } catch (error) {
    const { demoStore } = await import("@/lib/demo-data");
    resources = demoStore.getResources();
    users = demoStore.getUsers();
  }

  const resourceOptions = resources.map((r) => ({
    id: r.id,
    name: r.name,
    categoryName: r.category?.name,
    status: r.status,
    capacity: r.capacity,
  }));

  const userOptions = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
  }));

  return (
    <div className="container py-8 space-y-6 max-w-4xl">
      <div>
        <Link
          href="/reservations"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Reservations</span>
        </Link>
      </div>

      <ReservationForm
        resources={resourceOptions}
        users={userOptions}
        defaultResourceId={searchParams?.resourceId}
      />
    </div>
  );
}
