"use client";
import { useState } from "react";
import { useInventory } from "@/features/inventory";
import { useProducts } from "@/features/products";
import { inventoryService } from "@/features/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Warehouse, Search, RefreshCw, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "LOW_STOCK", label: "Low Stock" },
  { value: "DAMAGED", label: "Damaged" },
];

const WAREHOUSE_OPTIONS = [
  { value: "warehouse-001", label: "Surabaya Main Warehouse" },
  { value: "warehouse-002", label: "Semarang Export Warehouse" },
];

const GRADE_OPTIONS = [
  { value: "A", label: "Grade A" },
  { value: "B", label: "Grade B" },
  { value: "C", label: "Grade C" },
  { value: "PREMIUM", label: "Premium" },
];

export default function InventoryPage() {
  const { inventory, loading, total, page, limit, totalPages, setPage, setSearch, setStatus, setSortBy, setSortOrder, sortBy, sortOrder, refresh, createInventory } = useInventory();
  const { products } = useProducts();
  const [searchInput, setSearchInput] = useState("");
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Add Stock form state
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("MT");
  const [grade, setGrade] = useState("A");
  const [formError, setFormError] = useState<string | null>(null);

  const totalQuantity = inventory.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const lowStock = inventory.filter((i) => i.status === "LOW_STOCK").length;

  const productOptions = [
    { value: "", label: "Select Product" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ];

  const unitOptions = [
    { value: "MT", label: "Metric Ton (MT)" },
    { value: "KG", label: "Kilogram (KG)" },
    { value: "TON", label: "Ton" },
    { value: "BAG", label: "Bag" },
  ];

  const handleAddStock = async () => {
    setFormError(null);

    if (!selectedProductId) {
      setFormError("Please select a product");
      return;
    }
    if (!selectedWarehouseId) {
      setFormError("Please select a warehouse");
      return;
    }
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setFormError("Quantity must be a positive number");
      return;
    }

    try {
      setSubmitting(true);
      const selectedProduct = products.find((p) => p.id === selectedProductId);
      const stockValue = qty * (selectedProduct?.sellingPrice || 0);

      await createInventory({
        productId: selectedProductId,
        productName: selectedProduct?.name || "",
        batchId: `batch-${Date.now()}`,
        warehouseId: selectedWarehouseId,
        quantity: qty,
        unit,
        grade,
        stockValue,
      });

      // Reset form
      setSelectedProductId("");
      setSelectedWarehouseId("");
      setQuantity("");
      setUnit("MT");
      setGrade("A");
      setShowAddStockModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to add stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Inventory</h1>
          <p className="text-sm text-text-secondary">Track stock levels across all warehouses</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowAddStockModal(true)}>Add Stock</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Items" value={total} icon={<Warehouse className="h-5 w-5" />} />
        <KPICard title="Total Quantity" value={`${formatNumber(totalQuantity)} MT`} icon={<Warehouse className="h-5 w-5" />} />
        <KPICard title="Low Stock Alerts" value={lowStock} icon={<AlertTriangle className="h-5 w-5" />} />
        <KPICard title="Warehouses" value={new Set(inventory.map((i) => i.warehouseId)).size} icon={<Warehouse className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input type="text" placeholder="Search inventory..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : inventory.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">No inventory items found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Product</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Batch</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Warehouse</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Quantity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Available</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Value</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-background">
                    <td className="px-5 py-3 text-sm font-medium">{item.productName || item.productId}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{item.batchNumber || item.batchId}</td>
                    <td className="px-5 py-3 text-sm">{item.warehouseName || item.warehouseId}</td>
                    <td className="px-5 py-3 text-sm">{formatNumber(item.quantity)}</td>
                    <td className="px-5 py-3 text-sm">{formatNumber(item.availableQuantity)}</td>
                    <td className="px-5 py-3 text-sm font-medium">${item.stockValue.toLocaleString()}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border">
          <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      <Modal isOpen={showAddStockModal} onClose={() => { setShowAddStockModal(false); setFormError(null); }} title="Add Stock" description="Add new stock to inventory" size="lg">
        <div className="space-y-4">
          <Select
            label="Product *"
            options={productOptions}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Select a product"
          />

          <Select
            label="Warehouse *"
            options={WAREHOUSE_OPTIONS}
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
            placeholder="Select a warehouse"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity *"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="any"
            />
            <Select
              label="Unit"
              options={unitOptions}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>

          <Select
            label="Grade"
            options={GRADE_OPTIONS}
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          />

          {formError && (
            <div className="bg-danger/10 border border-danger/20 rounded-md p-3">
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => { setShowAddStockModal(false); setFormError(null); }}>
              Cancel
            </Button>
            <Button onClick={handleAddStock} loading={submitting}>
              Add Stock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
