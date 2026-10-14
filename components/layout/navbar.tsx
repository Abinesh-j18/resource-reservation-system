"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  Layers,
  BookMarked,
  Building2,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Resource Catalog",
    href: "/resources",
    icon: Layers,
  },
  {
    name: "Schedule & Timeline",
    href: "/schedule",
    icon: CalendarDays,
  },
  {
    name: "My Reservations",
    href: "/reservations",
    icon: BookMarked,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 font-bold tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-slate-900 flex items-center gap-1.5">
                PrimeReserve
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                  PRO
                </span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                Resource Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-800 font-semibold shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: System Indicator, User Profile, Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-50/80 border border-emerald-200/80 rounded-full px-3 py-1 text-emerald-800 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 border-l pl-3 ml-1">
            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300 shadow-xs">
              AD
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-none">
                Alex Chen (Admin)
              </span>
              <span className="text-[10px] text-slate-500 leading-none mt-0.5">
                alex@primewave.io
              </span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-700 h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b bg-white px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/" || pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-semibold"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <span className="font-medium text-slate-800">Alex Chen (Admin)</span>
            </div>
            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
              System Ready
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
