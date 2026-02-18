"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  page?: number;
  totalCount?: number;
  pageSize?: number;
}

export function Pagination({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  page,
  totalCount,
  pageSize,
}: PaginationProps) {
  if (!hasNext && !hasPrevious) return null;

  const showInfo = page !== undefined && totalCount !== undefined && pageSize !== undefined;
  const startItem = showInfo ? (page - 1) * pageSize + 1 : 0;
  const endItem = showInfo ? Math.min(page * pageSize, totalCount) : 0;

  return (
    <div className="flex items-center justify-between pt-4">
      {showInfo ? (
        <p className="text-sm text-muted-foreground">
          {startItem}–{endItem} of {totalCount}
        </p>
      ) : (
        <div />
      )}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={!hasPrevious}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={!hasNext}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
