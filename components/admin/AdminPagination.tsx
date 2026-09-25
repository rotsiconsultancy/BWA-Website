"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    return `${pathname}?${params.toString()}`;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="admin-pagination">
      <p className="admin-pagination-info">
        Showing{" "}
        <strong>
          {startItem}–{endItem}
        </strong>{" "}
        of <strong>{totalCount}</strong> items
      </p>
      <div className="admin-pagination-controls">
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="admin-pagination-btn"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Previous</span>
          </Link>
        ) : (
          <button disabled className="admin-pagination-btn">
            <ChevronLeft size={16} aria-hidden="true" />
            <span>Previous</span>
          </button>
        )}

        <span className="admin-pagination-page">
          Page {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="admin-pagination-btn"
          >
            <span>Next</span>
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <button disabled className="admin-pagination-btn">
            <span>Next</span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
