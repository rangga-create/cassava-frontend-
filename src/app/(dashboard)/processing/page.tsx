"use client";
import { useState } from "react";
import { useProcessing } from "@/features/processing";
import { useProducts } from "@/features/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Factory, Search, RefreshCw, TrendingUp } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function ProcessingPage() {
  const { orders, loading, total, page, limit, totalPages, setPage, setSearch, setStatus, refresh, createOrder } = useProcessing();
  const { products } = useProducts();
  const [searchInput, setSearchInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState("");
  const [inputQuantity, setInputQuantity] = useState("");
  const [outputQuantity, setOutputQuantity] = useState("");
  const [processingCost, setProcessingCost] = useState("");
  const [labor, setLabor] = useState("");
  const [energy, setEnergy] = useState("");
  const [packaging, setPackaging] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const avgYield = orders.length > 0 ? orders.reduce((sum, o) => sum + (o.yield || 0), 0) / orders.length : 0;
  const completedOrders = orders.filter((o) => o.status === "COMPLETED").length;

  const productOptions = [
    { value: "", label: "Select Raw Material" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ];

  const handleCreateOrder = async () => {
    setFormError(null);

    if (!selectedRawMaterialId) {
      setFormError("Please select a raw material");
      return;
    }
    const inputQty = parseFloat(inputQuantity);
    if (!inputQuantity || isNaN(inputQty) || inputQty <= 0) {
      setFormError("Input quantity must be a positive number");
      return;
    }

    try {
      setSubmitting(true);
      const selectedProduct = products.find((p) => p.id === selectedRawMaterialId);

      await createOrder({
        rawMaterialId: selectedRawMaterialId,
        rawMaterialName: selectedProduct?.name || "",
        inputQuantity: inputQty,
        outputQuantity: outputQuantity ? parseFloat(outputQuantity) : 0,
        processingCost: processingCost ? parseFloat(processingCost) : 0,
        labor: labor ? parseFloat(labor) : 0,
        energy: energy ? parseFloat(energy) : 0,
        packaging: packaging ? parseFloat(packaging) : 0,
      });

      // Reset form
      setSelectedRawMaterialId("");
      setInputQuantity("");
      setOutputQuantity("");
      setProcessingCost("");
      setLabor("");
      setEnergy("");
      setPackaging("");
      setShowCreateModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create processing order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Processing</h1>
          <p className="text-text-secondary">Manage Indocassava processing orders and yield tracking</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>New Processing Order</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Orders" value={total} icon={<Factory className="h-5 w-5" />} />
        <KPICard title="Completed" value={completedOrders} icon={<Factory className="h-5 w-5" />} />
        <KPICard title="Avg Yield" value={`${avgYield.toFixed(1)}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="In Progress" value={orders.filter((o) => o.status === "IN_PROGRESS").length} icon={<Factory className="h-5 w-5" />} />
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input type="text" placeholder="Search processing orders..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
          <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No processing orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Raw Material</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Input (MT)</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Output (MT)</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Yield</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Cost</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-background">
                    <td className="px-5 py-3 text-sm font-medium">{order.rawMaterialName || order.rawMaterialId}</td>
                    <td className="px-5 py-3 text-sm">{order.inputQuantity?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">{order.outputQuantity?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">{order.yield ? `${order.yield}%` : "-"}</td>
                    <td className="px-5 py-3 text-sm font-medium">${order.processingCost?.toLocaleString() || 0}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border">
          <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {/* New Processing Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormError(null); }} title="New Processing Order" description="Create a new processing order" size="lg">
        <div className="space-y-4">
          <Select
            label="Raw Material *"
            options={productOptions}
            value={selectedRawMaterialId}
            onChange={(e) => setSelectedRawMaterialId(e.target.value)}
            placeholder="Select raw material"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Input Quantity (MT) *"
              type="number"
              placeholder="0"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Output Quantity (MT)"
              type="number"
              placeholder="0"
              value={outputQuantity}
              onChange={(e) => setOutputQuantity(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Processing Cost"
              type="number"
              placeholder="0"
              value={processingCost}
              onChange={(e) => setProcessingCost(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Labor Cost"
              type="number"
              placeholder="0"
              value={labor}
              onChange={(e) => setLabor(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Energy Cost"
              type="number"
              placeholder="0"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          <Input
            label="Packaging Cost"
            type="number"
            placeholder="0"
            value={packaging}
            onChange={(e) => setPackaging(e.target.value)}
            min="0"
            step="any"
          />

          {formError && (
            <div className="bg-danger/10 border border-danger/20 rounded-md p-3">
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setFormError(null); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} loading={submitting}>
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
