"use client";

import React from "react";
import { Table, Pagination } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types";

interface CompaniesTableProps {
  companies: Company[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompaniesTable({
  companies,
  loading,
  total,
  page,
  limit,
  totalPages,
  sortBy,
  sortOrder,
  onSort,
  onPageChange,
  onEdit,
  onDelete,
}: CompaniesTableProps) {
  const columns = [
    {
      key: "name",
      header: "Company Name",
      sortable: true,
      render: (company: Company) => (
        <div>
          <p className="font-medium text-navy">{company.name}</p>
          {company.industry && (
            <p className="text-xs text-secondary">{company.industry}</p>
          )}
        </div>
      ),
    },
    {
      key: "country",
      header: "Country",
      sortable: true,
      render: (company: Company) => (
        <span className="text-sm">{company.country || "-"}</span>
      ),
    },
    {
      key: "city",
      header: "Location",
      render: (company: Company) => (
        <span className="text-sm">
          {[company.city, company.province].filter(Boolean).join(", ") || "-"}
        </span>
      ),
    },
    {
      key: "email",
      header: "Contact",
      render: (company: Company) => (
        <div>
          <p className="text-sm">{company.email || "-"}</p>
          {company.phone && (
            <p className="text-xs text-secondary">{company.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (company: Company) => (
        <StatusBadge status={company.status || "ACTIVE"} />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (company: Company) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(company)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(company)}
            className="text-danger hover:text-danger"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        data={companies}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        emptyMessage="No companies found"
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
    </div>
  );
}
