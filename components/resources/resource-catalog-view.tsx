"use client";

import { useState, useMemo } from "react";
import { ResourceCard } from "@/components/resources/resource-card";
import { ResourceFilters } from "@/components/resources/resource-filters";
import { ResourceDialog } from "@/components/resources/resource-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Layers, SlidersHorizontal } from "lucide-react";

interface ResourceCatalogViewProps {
  resources: any[];
  categories: any[];
  users: any[];
}

export function ResourceCatalogView({
  resources,
  categories,
  users,
}: ResourceCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [minCapacity, setMinCapacity] = useState("");

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = res.name.toLowerCase().includes(query);
        const matchesLoc = res.location.toLowerCase().includes(query);
        const matchesCat = res.category.name.toLowerCase().includes(query);
        if (!matchesName && !matchesLoc && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== "ALL" && res.categoryId !== selectedCategory) {
        return false;
      }

      // Status
      if (selectedStatus !== "ALL" && res.status !== selectedStatus) {
        return false;
      }

      // Capacity
      if (minCapacity) {
        const min = parseInt(minCapacity, 10);
        if (!isNaN(min) && res.capacity < min) {
          return false;
        }
      }

      return true;
    });
  }, [resources, searchQuery, selectedCategory, selectedStatus, minCapacity]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedStatus("ALL");
    setMinCapacity("");
  };

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
    <div className="space-y-6">
      {/* Search and Filters */}
      <ResourceFilters
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        minCapacity={minCapacity}
        setMinCapacity={setMinCapacity}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredResources.length}</strong> of{" "}
          {resources.length} total resources
        </span>
        <div className="flex items-center gap-2">
          <ResourceDialog
            categories={categories}
            triggerButton={
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8 text-xs">
                <PlusCircle className="h-3.5 w-3.5" />
                Add Resource
              </Button>
            }
          />
        </div>
      </div>

      {/* Grid of Resource Cards */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700">No resources match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search term, category selection, or capacity criteria.
          </p>
          <Button variant="outline" size="sm" onClick={handleReset} className="mt-4">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              categories={categories}
              allResources={resourceOptions}
              allUsers={userOptions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
