"use client";

import { useState } from "react";
import { useCustomers } from "@/features/customers";
import { CustomersTable } from "@/features/customers";
import { CustomerForm } from "@/features/customers";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Plus, Users, Search, RefreshCw, DollarSign } from "lucide-react";
import type { Customer } from "@/types";

const COUNTRY_OPTIONS = [
  { value: "", label: "All Countries" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "China", label: "China" },
  { value: "Japan", label: "Japan" },
  { value: "South Korea", label: "South Korea" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "India", label: "India" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function CustomersPage() {
  const { customers, loading, total, page, limit, totalPages, setPage, setSearch, setCountry, setStatus, setSortBy, setSortOrder, sortBy, sortOrder, refresh, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;
  const totalPurchase = customers.reduce((sum, c) => sum + (c.totalPurchase || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Customers</h1>
          <p className="text-sm text-text-secondary">Manage your customer relationships</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>Add Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Customers" value={total} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Active" value={activeCustomers} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Total Purchase" value={`$${totalPurchase.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Inactive" value={total - activeCustomers} icon={<Users className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input type="text" placeholder="Search customers..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Select options={COUNTRY_OPTIONS} value={undefined} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <CustomersTable customers={customers} loading={loading} page={page} limit={limit} total={total} totalPages={totalPages} sortBy={sortBy} sortOrder={sortOrder} onSort={(key) => { setSortBy(key); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }} onPageChange={setPage} onView={(c) => console.log("View:", c)} onEdit={(c) => { setSelectedCustomer(c); setShowEditModal(true); }} onDelete={(c) => { setSelectedCustomer(c); setShowDeleteModal(true); }} />

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Customer" size="lg">
        <CustomerForm onSubmit={async (data) => { setSubmitting(true); await createCustomer(data); setShowCreateModal(false); setSubmitting(false); }} onCancel={() => setShowCreateModal(false)} loading={submitting} />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedCustomer(null); }} title="Edit Customer" size="lg">
        {selectedCustomer && <CustomerForm customer={selectedCustomer} onSubmit={async (data) => { setSubmitting(true); await updateCustomer(selectedCustomer.id, data); setShowEditModal(false); setSelectedCustomer(null); setSubmitting(false); }} onCancel={() => { setShowEditModal(false); setSelectedCustomer(null); }} loading={submitting} />}
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedCustomer(null); }} title="Delete Customer">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Are you sure you want to delete <strong>{selectedCustomer?.companyName}</strong>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedCustomer(null); }}>Cancel</Button>
            <Button variant="danger" onClick={async () => { setSubmitting(true); await deleteCustomer(selectedCustomer!.id); setShowDeleteModal(false); setSelectedCustomer(null); setSubmitting(false); }} loading={submitting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
