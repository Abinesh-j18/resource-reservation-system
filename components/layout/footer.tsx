import Link from "next/link";
import { ShieldCheck, Cpu, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-slate-50 py-6 text-sm text-slate-600">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">PrimeReserve</span>
          <span className="text-slate-400">|</span>
          <span className="text-xs">
            Resource Reservation Management System &bull; PrimeWave Lab Assessment
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            PostgreSQL &amp; Prisma
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            ACID Transaction Protected
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="h-3.5 w-3.5 text-emerald-600" />
            Next.js App Router
          </span>
        </div>
      </div>
    </footer>
  );
}
