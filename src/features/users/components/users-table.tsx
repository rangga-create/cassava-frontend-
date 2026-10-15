"use client";

import React from "react";
import { Table, Pagination } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-danger/10 text-danger",
  OWNER: "bg-primary/10 text-primary",
  ADMIN: "bg-info/10 text-info",
  MANAGER: "bg-warning/10 text-warning",
  FINANCE: "bg-info/10 text-info",
  PROCUREMENT: "bg-text-secondary/10 text-text-secondary",
  WAREHOUSE: "bg-warning/10 text-warning",
  SALES: "bg-success/10 text-success",
  LOGISTICS: "bg-info/10 text-info",
  QUALITY_CONTROL: "bg-text-secondary/10 text-text-secondary",
  VIEWER: "bg-text-secondary/10 text-text-secondary",
};

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  OWNER: "Owner",
  ADMIN: "Admin",
  MANAGER: "Manager",
  FINANCE: "Finance",
  PROCUREMENT: "Procurement",
  WAREHOUSE: "Warehouse",
  SALES: "Sales",
  LOGISTICS: "Logistics",
  QUALITY_CONTROL: "Quality Control",
  VIEWER: "Viewer",
};

export function UsersTable({
  users,
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
}: UsersTableProps) {
  const columns = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-medium text-navy">{user.name}</p>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium ${roleColors[user.role] || "bg-secondary/10 text-secondary"}`}>
          {roleLabels[user.role] || user.role}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (user: User) => (
        <span className="text-sm">{user.phone || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <StatusBadge status={user.status || "ACTIVE"} />
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-secondary">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(user)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(user)}
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
        data={users}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        emptyMessage="No users found"
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
