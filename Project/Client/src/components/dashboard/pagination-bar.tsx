import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import type { Pagination } from "@/services";

interface PaginationBarProps {
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function PaginationBar({ pagination, onPageChange, loading }: PaginationBarProps) {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3 text-[12px] text-muted-foreground sm:px-6">
      <span>
        Showing <span className="font-semibold text-foreground">{from}–{to}</span> of{" "}
        <span className="font-semibold text-foreground">{total.toLocaleString()}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="h-7.5 gap-1 rounded-md px-2.5 text-xs font-bold"
        >
          <CaretLeftIcon className="size-3.5" />
          Prev
        </Button>
        <span className="px-1 text-xs font-semibold whitespace-nowrap">
          Page {page} / {Math.max(totalPages, 1)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="h-7.5 gap-1 rounded-md px-2.5 text-xs font-bold"
        >
          Next
          <CaretRightIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
