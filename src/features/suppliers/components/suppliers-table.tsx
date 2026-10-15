"use client";

import { Table, Column, Pagination } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Star } from "lucide-react";
import type { Supplier } from "@/types";

interface SuppliersTableProps {
  suppliers: Supplier[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onView: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

function StarRating({ score }: { score: number }) {
  const stars = Math.round(score / 20); // Convert 0-100 to 0-5
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= stars ? "fill-warning text-warning" : "text-border"
          }`}
        />
      ))}
      <span className="ml-1 text-sm text-text-secondary">{score}</span>
    </div>
  );
}

export function SuppliersTable({
  suppliers,
  loading,
  page,
  limit,
  total,
  totalPages,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  const columns: Column<Supplier>[] = [
    {
      key: "companyName",
      header: "Company",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-text">{item.companyName}</p>
          <p className="text-xs text-text-secondary">{item.contactName}</p>
        </div>
      ),
    },
    {
      key: "country",
      header: "Country",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.country}</span>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (item) => (
        <div>
          <p className="text-sm text-text">{item.email}</p>
          <p className="text-xs text-text-secondary">{item.phone}</p>
        </div>
      ),
    },
    {
      key: "qualityScore",
      header: "Quality",
      sortable: true,
      render: (item) => <StarRating score={item.qualityScore} />,
    },
    {
      key: "reliabilityScore",
      header: "Reliability",
      sortable: true,
      render: (item) => <StarRating score={item.reliabilityScore} />,
    },
    {
      key: "paymentTerms",
      header: "Payment Terms",
      render: (item) => (
        <span className="px-2 py-0.5 text-xs font-medium bg-background rounded">
          {item.paymentTerms}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (item) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(item);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            className="text-danger hover:text-danger hover:bg-danger/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={suppliers}
        loading={loading}
        emptyMessage="No suppliers found"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
      />
      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
