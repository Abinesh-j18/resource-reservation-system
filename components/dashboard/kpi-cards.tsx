import {
  Layers,
  CalendarCheck2,
  Clock,
  Wrench,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardsProps {
  totalResources: number;
  activeResources: number;
  maintenanceResources: number;
  reservationsToday: number;
  upcomingReservations: number;
  activeBookingsNow: number;
}

export function KpiCards({
  totalResources,
  activeResources,
  maintenanceResources,
  reservationsToday,
  upcomingReservations,
  activeBookingsNow,
}: KpiCardsProps) {
  const cards = [
    {
      title: "Active Resources",
      value: activeResources,
      subtitle: `${totalResources} total configured (${maintenanceResources} in maintenance)`,
      icon: Layers,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      title: "Reservations Today",
      value: reservationsToday,
      subtitle: "Confirmed bookings scheduled today",
      icon: CalendarCheck2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: "Currently In Use",
      value: activeBookingsNow,
      subtitle: "Resources occupied at this exact time",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingReservations,
      subtitle: "Scheduled future reservations",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-5 flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {card.subtitle}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
