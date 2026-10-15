"use client";

import { useState } from "react";
import { useSuppliers } from "@/features/suppliers";
import { SuppliersTable } from "@/features/suppliers";
import { SupplierForm } from "@/features/suppliers";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Plus, Users, Search, Download, RefreshCw, Star } from "lucide-react";
import type { Supplier } from "@/types";
import type { SupplierInput } from "@/lib/validations";

const COUNTRY_OPTIONS = [
  { value: "", label: "All Countries" },
  { value: "Indonesia", label: "Indonesia" },
  { value: "Thailand", label: "Thailand" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "Philippines", label: "Philippines" },
  { value: "Malaysia", label: "Malaysia" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function SuppliersPage() {
  const {
    suppliers,
    loading,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setSearch,
    setCountry,
    setStatus,
    setSortBy,
    setSortOrder,
    sortBy,
    sortOrder,
    refresh,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  } = useSuppliers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeSuppliers = suppliers.filter((s) => s.status === "ACTIVE").length;
  const avgQuality =
    suppliers.length > 0
      ? suppliers.reduce((sum, s) => sum + s.qualityScore, 0) / suppliers.length
      : 0;
  const avgReliability =
    suppliers.length > 0
      ? suppliers.reduce((sum, s) => sum + s.reliabilityScore, 0) / suppliers.length
      : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleCreate = async (data: SupplierInput) => {
    try {
      setSubmitting(true);
      await createSupplier(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create supplier:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: SupplierInput) => {
    if (!selectedSupplier) return;
    try {
      setSubmitting(true);
      await updateSupplier(selectedSupplier.id, data);
      setShowEditModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error("Failed to update supplier:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSupplier) return;
    try {
      setSubmitting(true);
      await deleteSupplier(selectedSupplier.id);
      setShowDeleteModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Suppliers</h1>
          <p className="text-sm text-text-secondary">
            Manage your supplier relationships and performance
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
          Add Supplier
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Suppliers" value={total} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Active Suppliers" value={activeSuppliers} icon={<Users className="h-5 w-5" />} />
        <KPICard title="Avg Quality Score" value={`${avgQuality.toFixed(0)}/100`} icon={<Star className="h-5 w-5" />} />
        <KPICard title="Avg Reliability" value={`${avgReliability.toFixed(0)}/100`} icon={<Star className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by company or contact name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        <Select options={COUNTRY_OPTIONS} value={undefined} onChange={(e) => { setCountry(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        <Button variant="secondary"><Download className="h-4 w-4" /></Button>
      </div>

      {/* Suppliers Table */}
      <SuppliersTable
        suppliers={suppliers}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={setPage}
        onView={(supplier) => { console.log("View supplier:", supplier); }}
        onEdit={(supplier) => { setSelectedSupplier(supplier); setShowEditModal(true); }}
        onDelete={(supplier) => { setSelectedSupplier(supplier); setShowDeleteModal(true); }}
      />

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Supplier" description="Create a new supplier in your network" size="lg">
        <SupplierForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} loading={submitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedSupplier(null); }} title="Edit Supplier" description="Update supplier information" size="lg">
        {selectedSupplier && (
          <SupplierForm supplier={selectedSupplier} onSubmit={handleEdit} onCancel={() => { setShowEditModal(false); setSelectedSupplier(null); }} loading={submitting} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSupplier(null); }}
        title="Delete Supplier"
        description="Are you sure you want to delete this supplier? This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedSupplier(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting}>Delete Supplier</Button>
          </>
        }
      >
        {selectedSupplier && (
          <div className="py-2">
            <p className="text-sm text-text-secondary">You are about to delete:</p>
            <p className="mt-2 font-medium text-text">{selectedSupplier.companyName}</p>
            <p className="text-sm text-text-secondary">{selectedSupplier.contactName} &bull; {selectedSupplier.country}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
