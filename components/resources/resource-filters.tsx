"use client";

import { Search, Filter, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ResourceFiltersProps {
  categories: { id: string; name: string }[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  minCapacity: string;
  setMinCapacity: (val: string) => void;
  onReset: () => void;
}

export function ResourceFilters({
  categories,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  minCapacity,
  setMinCapacity,
  onReset,
}: ResourceFiltersProps) {
  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "ALL" ||
    selectedStatus !== "ALL" ||
    minCapacity !== "";

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search by name/location */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search resources, location..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter by Category */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter by Status */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter by Capacity */}
        <Select value={minCapacity || "ALL"} onValueChange={(v) => setMinCapacity(v === "ALL" ? "" : v)}>
          <SelectTrigger className="bg-slate-50 border-slate-200">
            <SelectValue placeholder="Min Capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any Capacity</SelectItem>
            <SelectItem value="2">2+ People</SelectItem>
            <SelectItem value="6">6+ People</SelectItem>
            <SelectItem value="12">12+ People</SelectItem>
            <SelectItem value="25">25+ People</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-1 border-t text-xs text-slate-500">
          <span>Active filter constraints applied</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
