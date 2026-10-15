"use client";

import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "@/types";

interface CustomersTableProps {
  customers: Customer[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortOrder: string;
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function CustomersTable({
  customers,
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
}: CustomersTableProps) {
  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <span className="text-text-secondary ml-1">↕</span>;
    return <span className="text-primary ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center text-text-secondary">
        <p>No customers found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text" onClick={() => onSort("companyName")}>
                Company<SortIcon field="companyName" />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Contact
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Country
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider cursor-pointer hover:text-text" onClick={() => onSort("totalPurchase")}>
                Total Purchase<SortIcon field="totalPurchase" />
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Outstanding
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-background">
                <td className="px-6 py-4">
                  <p className="font-medium text-text">{customer.companyName}</p>
                  <p className="text-sm text-text-secondary">{customer.email}</p>
                </td>
                <td className="px-6 py-4 text-sm text-text">{customer.contactName}</td>
                <td className="px-6 py-4 text-sm text-text">{customer.country}</td>
                <td className="px-6 py-4 text-sm font-medium text-text">{formatCurrency(customer.totalPurchase)}</td>
                <td className="px-6 py-4 text-sm text-text">{formatCurrency(customer.outstanding)}</td>
                <td className="px-6 py-4"><StatusBadge status={customer.status} /></td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => onView(customer)} className="text-primary hover:text-primary-dark text-sm mr-3">View</button>
                  <button onClick={() => onEdit(customer)} className="text-text-secondary hover:text-text text-sm mr-3">Edit</button>
                  <button onClick={() => onDelete(customer)} className="text-danger hover:text-danger text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border">
        <p className="text-sm text-text-secondary">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-background disabled:opacity-50">Prev</button>
          <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="px-3 py-1 text-sm border border-border rounded-lg hover:bg-background disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
