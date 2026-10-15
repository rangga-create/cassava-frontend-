"use client";

import { useState } from "react";
import { useProcurement } from "@/features/procurement";
import { PurchaseOrdersTable } from "@/features/procurement";
import { PurchaseOrderForm } from "@/features/procurement";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Plus, ShoppingCart, Search, Download, RefreshCw } from "lucide-react";
import type { PurchaseOrder } from "@/types";
import type { PurchaseOrderInput } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "SUPPLIER_CONFIRMED", label: "Supplier Confirmed" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "RECEIVED", label: "Received" },
  { value: "QUALITY_CONTROL", label: "Quality Control" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function ProcurementPage() {
  const {
    purchaseOrders,
    loading,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setSearch,
    setStatus,
    setSortBy,
    setSortOrder,
    sortBy,
    sortOrder,
    refresh,
    createPurchaseOrder,
    updatePurchaseOrder,
    updateStatus,
    deletePurchaseOrder,
  } = useProcurement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const draftOrders = purchaseOrders.filter((o) => o.status === "DRAFT").length;
  const pendingOrders = purchaseOrders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
  ).length;
  const totalValue = purchaseOrders.reduce((sum, o) => sum + o.total, 0);

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

  const handleCreate = async (data: PurchaseOrderInput) => {
    try {
      setSubmitting(true);
      await createPurchaseOrder(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create purchase order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: PurchaseOrderInput) => {
    if (!selectedOrder) return;
    try {
      setSubmitting(true);
      await updatePurchaseOrder(selectedOrder.id, data);
      setShowEditModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to update purchase order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (order: PurchaseOrder, newStatus: string) => {
    try {
      await updateStatus(order.id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    try {
      setSubmitting(true);
      await deletePurchaseOrder(selectedOrder.id);
      setShowDeleteModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Failed to delete purchase order:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Procurement</h1>
          <p className="text-sm text-text-secondary">
            Manage purchase orders and supplier transactions
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
          New Purchase Order
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total POs" value={total} icon={<ShoppingCart className="h-5 w-5" />} />
        <KPICard title="Draft Orders" value={draftOrders} icon={<ShoppingCart className="h-5 w-5" />} />
        <KPICard title="Pending Orders" value={pendingOrders} icon={<ShoppingCart className="h-5 w-5" />} />
        <KPICard title="Total Value" value={formatCurrency(totalValue)} icon={<ShoppingCart className="h-5 w-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by PO number or supplier..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-48" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        <Button variant="secondary"><Download className="h-4 w-4" /></Button>
      </div>

      {/* Purchase Orders Table */}
      <PurchaseOrdersTable
        purchaseOrders={purchaseOrders}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={setPage}
        onView={(order) => { console.log("View order:", order); }}
        onEdit={(order) => { setSelectedOrder(order); setShowEditModal(true); }}
        onDelete={(order) => { setSelectedOrder(order); setShowDeleteModal(true); }}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Purchase Order" description="Create a new purchase order" size="lg">
        <PurchaseOrderForm onSubmit={handleCreate} onCancel={() => setShowCreateModal(false)} loading={submitting} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedOrder(null); }} title="Edit Purchase Order" description="Update purchase order details" size="lg">
        {selectedOrder && (
          <PurchaseOrderForm order={selectedOrder} onSubmit={handleEdit} onCancel={() => { setShowEditModal(false); setSelectedOrder(null); }} loading={submitting} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedOrder(null); }}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this purchase order? This action cannot be undone."
        footer={
          <>
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedOrder(null); }}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={submitting}>Delete Order</Button>
          </>
        }
      >
        {selectedOrder && (
          <div className="py-2">
            <p className="text-sm text-text-secondary">You are about to delete:</p>
            <p className="mt-2 font-medium text-text">{selectedOrder.poNumber}</p>
            <p className="text-sm text-text-secondary">{selectedOrder.supplierName || selectedOrder.supplierId} &bull; {formatCurrency(selectedOrder.total)}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
