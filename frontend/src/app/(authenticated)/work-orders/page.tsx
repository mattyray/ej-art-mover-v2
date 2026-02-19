"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ListSkeleton } from "@/components/loading-skeleton";
import { SearchInput } from "@/components/search-input";
import { Fab } from "@/components/fab";
import { Button } from "@/components/ui/button";
import { WorkOrderSection } from "@/components/work-orders/work-order-section";
import { WorkOrderFilterBar } from "@/components/work-orders/work-order-filter-bar";
import { WorkOrderFlatList } from "@/components/work-orders/work-order-flat-list";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { Plus } from "lucide-react";

// Map the single filter value to status + invoiced API params
function filterToParams(filter: string) {
  switch (filter) {
    case "pending":
      return { status: "pending" };
    case "scheduled":
      return { status: "in_progress" };
    case "completed":
      return { status: "completed", invoiced: "false" };
    case "invoiced":
      return { status: "completed", invoiced: "true" };
    default:
      return {};
  }
}

export default function WorkOrdersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [ordering, setOrdering] = useState("-updated_at");
  const [page, setPage] = useState(1);

  const isFiltering = search !== "" || filter !== "all";

  // Section queries — only fire when NOT filtering
  const pendingQuery = useWorkOrders(
    { status: "pending" },
    { enabled: !isFiltering }
  );
  const scheduledQuery = useWorkOrders(
    { status: "in_progress" },
    { enabled: !isFiltering }
  );
  const completedUninvoicedQuery = useWorkOrders(
    { status: "completed", invoiced: "false" },
    { enabled: !isFiltering }
  );
  const completedInvoicedQuery = useWorkOrders(
    { status: "completed", invoiced: "true" },
    { enabled: !isFiltering }
  );

  // Build flat list filters
  const flatFilters = {
    ...filterToParams(filter),
    search: search || undefined,
    ordering,
    page,
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
    setPage(1);
  }, []);

  const handleOrderingChange = useCallback((value: string) => {
    setOrdering(value);
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setSearch("");
    setFilter("all");
    setOrdering("-updated_at");
    setPage(1);
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Work Orders"
        actions={
          <Link href="/work-orders/new" className="hidden md:block">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Work Order
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="space-y-3">
        <SearchInput
          value={search}
          onSearch={handleSearch}
          placeholder="Search work orders..."
        />
        <WorkOrderFilterBar
          filter={filter}
          onFilterChange={handleFilterChange}
          ordering={ordering}
          onOrderingChange={handleOrderingChange}
          onClear={handleClear}
          isFiltering={isFiltering}
        />
      </div>

      {/* Content: Sections (default) or Flat list (when filtering) */}
      {isFiltering ? (
        <WorkOrderFlatList filters={flatFilters} onPageChange={setPage} />
      ) : (
        <>
          {pendingQuery.isLoading &&
          scheduledQuery.isLoading &&
          completedUninvoicedQuery.isLoading ? (
            <ListSkeleton count={5} />
          ) : (
            <div className="space-y-4">
              <WorkOrderSection
                title="Pending"
                workOrders={pendingQuery.data?.results || []}
                totalCount={pendingQuery.data?.count}
                isLoading={pendingQuery.isLoading}
              />
              <WorkOrderSection
                title="Scheduled"
                workOrders={scheduledQuery.data?.results || []}
                totalCount={scheduledQuery.data?.count}
                isLoading={scheduledQuery.isLoading}
              />
              <WorkOrderSection
                title="Completed (Uninvoiced)"
                workOrders={completedUninvoicedQuery.data?.results || []}
                totalCount={completedUninvoicedQuery.data?.count}
                isLoading={completedUninvoicedQuery.isLoading}
                defaultOpen={false}
              />
              <WorkOrderSection
                title="Completed (Invoiced)"
                workOrders={completedInvoicedQuery.data?.results || []}
                totalCount={completedInvoicedQuery.data?.count}
                isLoading={completedInvoicedQuery.isLoading}
                defaultOpen={false}
              />
            </div>
          )}
        </>
      )}

      <Fab href="/work-orders/new" label="New Work Order" />
    </div>
  );
}
