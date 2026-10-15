"use client";

import { Table, Column, Pagination } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, ArrowRight } from "lucide-react";
import type { PurchaseOrder } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onView: (order: PurchaseOrder) => void;
  onEdit: (order: PurchaseOrder) => void;
  onDelete: (order: PurchaseOrder) => void;
  onUpdateStatus: (order: PurchaseOrder, status: string) => void;
}

const STATUS_FLOW = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "SUPPLIER_CONFIRMED",
  "IN_TRANSIT",
  "RECEIVED",
  "QUALITY_CONTROL",
  "COMPLETED",
];

function getNextStatus(currentStatus: string): string | null {
  const index = STATUS_FLOW.indexOf(currentStatus);
  if (index < 0 || index >= STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function PurchaseOrdersTable({
  purchaseOrders,
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
  onUpdateStatus,
}: PurchaseOrdersTableProps) {
  const columns: Column<PurchaseOrder>[] = [
    {
      key: "poNumber",
      header: "PO Number",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-primary">{item.poNumber}</span>
      ),
    },
    {
      key: "supplierName",
      header: "Supplier",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{item.supplierName || item.supplierId}</span>
      ),
    },
    {
      key: "productName",
      header: "Product",
      render: (item) => (
        <span className="text-sm">{item.productName || item.productId}</span>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      sortable: true,
      render: (item) => (
        <span className="font-medium">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (item) => formatCurrency(item.price),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-navy">{formatCurrency(item.total)}</span>
      ),
    },
    {
      key: "expectedDelivery",
      header: "Expected",
      sortable: true,
      render: (item) => (
        <span className="text-sm">
          {item.expectedDelivery ? formatDate(item.expectedDelivery) : "-"}
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
      className: "w-32",
      render: (item) => {
        const nextStatus = getNextStatus(item.status);
        return (
          <div className="flex items-center gap-1">
            {nextStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(item, nextStatus);
                }}
                className="text-primary hover:text-primary hover:bg-primary/10"
                title={`Move to ${nextStatus}`}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
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
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={purchaseOrders}
        loading={loading}
        emptyMessage="No purchase orders found"
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
