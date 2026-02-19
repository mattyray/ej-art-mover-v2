"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WorkOrderFilterBarProps {
  filter: string;
  onFilterChange: (v: string) => void;
  ordering: string;
  onOrderingChange: (v: string) => void;
  onClear: () => void;
  isFiltering: boolean;
}

export function WorkOrderFilterBar({
  filter,
  onFilterChange,
  ordering,
  onOrderingChange,
  onClear,
  isFiltering,
}: WorkOrderFilterBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <Select value={filter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-[220px]">
          <SelectValue placeholder="All Work Orders" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Work Orders</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="invoiced">Completed & Invoiced</SelectItem>
        </SelectContent>
      </Select>

      {isFiltering && (
        <Select value={ordering} onValueChange={onOrderingChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-updated_at">Recent</SelectItem>
            <SelectItem value="created_at">Oldest</SelectItem>
            <SelectItem value="-id">Newest</SelectItem>
            <SelectItem value="id">WO #</SelectItem>
          </SelectContent>
        </Select>
      )}

      {isFiltering && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground self-start"
          onClick={onClear}
        >
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
