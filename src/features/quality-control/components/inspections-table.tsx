"use client";

import { Table, Column, Pagination } from "@/components/ui/table";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { QualityInspection } from "@/types";
import { formatDate } from "@/lib/utils";

interface InspectionsTableProps {
  inspections: QualityInspection[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onView: (inspection: QualityInspection) => void;
  onEdit: (inspection: QualityInspection) => void;
}

function ResultIcon({ result }: { result: string }) {
  switch (result) {
    case "APPROVED":
      return <CheckCircle className="h-5 w-5 text-success" />;
    case "CONDITIONAL":
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case "REJECTED":
      return <XCircle className="h-5 w-5 text-danger" />;
    default:
      return null;
  }
}

function QualityBar({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 70) return "bg-success";
    if (s >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-border rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-text">{score}</span>
    </div>
  );
}

export function InspectionsTable({
  inspections,
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
}: InspectionsTableProps) {
  const columns: Column<QualityInspection>[] = [
    {
      key: "batchNumber",
      header: "Batch",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-primary">
          {item.batchNumber || item.batchId}
        </span>
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
      key: "qualityScore",
      header: "Score",
      sortable: true,
      render: (item) => <QualityBar score={item.qualityScore} />,
    },
    {
      key: "result",
      header: "Result",
      render: (item) => (
        <div className="flex items-center gap-2">
          <ResultIcon result={item.result} />
          <StatusBadge
            status={
              item.result === "APPROVED"
                ? "APPROVED"
                : item.result === "CONDITIONAL"
                  ? "CONDITIONAL"
                  : "REJECTED"
            }
          />
        </div>
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
      key: "inspector",
      header: "Inspector",
      render: (item) => (
        <span className="text-sm text-text-secondary">{item.inspector}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-20",
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
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={inspections}
        loading={loading}
        emptyMessage="No quality inspections found"
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
