import Link from "next/link";
import { Layers, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container py-24 max-w-lg mx-auto text-center space-y-6">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
        <Layers className="h-8 w-8 text-emerald-600" />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 inline-block">
          Error 404
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
          The page or facility resource you are looking for does not exist or has been relocated within the reservation system.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Button>
        </Link>
        <Link href="/resources">
          <Button variant="outline" className="gap-2">
            <Search className="h-4 w-4" />
            <span>Browse Catalog</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
