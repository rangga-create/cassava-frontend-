"use client";

import { Table, Column, Pagination } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  FRESH: "Fresh",
  DRIED: "Dried",
  CHIPS: "Chips",
  FLOUR: "Flour",
  TAPIOCA_STARCH: "Tapioca Starch",
  PELLETS: "Pellets",
  FROZEN: "Frozen",
  OTHER: "Other",
};

export function ProductsTable({
  products,
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
}: ProductsTableProps) {
  const columns: Column<Product>[] = [
    {
      key: "sku",
      header: "SKU",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-primary">{item.sku}</span>
      ),
    },
    {
      key: "name",
      header: "Product Name",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-text">{item.name}</p>
          {item.description && (
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {CATEGORY_LABELS[item.category] || item.category}
        </span>
      ),
    },
    {
      key: "grade",
      header: "Grade",
      render: (item) => (
        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
          {item.grade}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      sortable: true,
      render: (item) => (
        <span className="font-medium">
          {item.stock} {item.unit}
        </span>
      ),
    },
    {
      key: "sellingPrice",
      header: "Price",
      sortable: true,
      render: (item) => formatCurrency(item.sellingPrice),
    },
    {
      key: "margin",
      header: "Margin",
      sortable: true,
      render: (item) => (
        <span
          className={
            item.margin >= 20
              ? "text-success font-medium"
              : item.margin >= 10
                ? "text-warning font-medium"
                : "text-danger font-medium"
          }
        >
          {item.margin.toFixed(1)}%
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
        data={products}
        loading={loading}
        emptyMessage="No products found"
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
