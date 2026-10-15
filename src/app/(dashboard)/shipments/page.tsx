"use client";
import { useState } from "react";
import { useShipments } from "@/features/shipments";
import { useProducts } from "@/features/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Truck, Search, RefreshCw, Clock } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PREPARING", label: "Preparing" },
  { value: "LOADED", label: "Loaded" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "DELIVERED", label: "Delivered" },
];

export default function ShipmentsPage() {
  const { shipments, loading, total, page, limit, totalPages, setPage, setSearch, setStatus, refresh, createShipment } = useShipments();
  const { products } = useProducts();
  const [searchInput, setSearchInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [container, setContainer] = useState("");
  const [carrier, setCarrier] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [port, setPort] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [etd, setEtd] = useState("");
  const [eta, setEta] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const inTransit = shipments.filter((s) => s.status === "IN_TRANSIT").length;
  const delivered = shipments.filter((s) => s.status === "DELIVERED").length;

  const productOptions = [
    { value: "", label: "Select Product" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ];

  const handleCreateShipment = async () => {
    setFormError(null);

    if (!container.trim()) {
      setFormError("Container number is required");
      return;
    }
    if (!carrier.trim()) {
      setFormError("Carrier name is required");
      return;
    }
    if (!origin.trim()) {
      setFormError("Origin is required");
      return;
    }
    if (!destination.trim()) {
      setFormError("Destination is required");
      return;
    }
    if (!selectedProductId) {
      setFormError("Please select a product");
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

      await createShipment({
        container,
        carrier,
        origin,
        destination,
        port: port || undefined,
        productId: selectedProductId,
        productName: selectedProduct?.name || "",
        quantity: qty,
        etd: etd || undefined,
        eta: eta || undefined,
      });

      // Reset form
      setContainer("");
      setCarrier("");
      setOrigin("");
      setDestination("");
      setPort("");
      setSelectedProductId("");
      setQuantity("");
      setEtd("");
      setEta("");
      setShowCreateModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create shipment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Shipments</h1>
          <p className="text-sm text-text-secondary">Track container shipments and deliveries</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>New Shipment</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Shipments" value={total} icon={<Truck className="h-5 w-5" />} />
        <KPICard title="In Transit" value={inTransit} icon={<Truck className="h-5 w-5" />} />
        <KPICard title="Delivered" value={delivered} icon={<Truck className="h-5 w-5" />} />
        <KPICard title="Preparing" value={shipments.filter((s) => s.status === "PREPARING").length} icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input type="text" placeholder="Search by container or carrier..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : shipments.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">No shipments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Container</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Carrier</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Origin</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Destination</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Product</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">ETD</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">ETA</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-background">
                    <td className="px-5 py-3 font-medium text-primary text-sm">{s.container}</td>
                    <td className="px-5 py-3 text-sm">{s.carrier}</td>
                    <td className="px-5 py-3 text-sm">{s.origin}</td>
                    <td className="px-5 py-3 text-sm">{s.destination}</td>
                    <td className="px-5 py-3 text-sm">{s.productName || s.productId}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{s.etd ? new Date(s.etd).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{s.eta ? new Date(s.eta).toLocaleDateString() : "-"}</td>
                    <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
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

      {/* New Shipment Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormError(null); }} title="New Shipment" description="Create a new shipment" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Container Number *"
              placeholder="e.g. MSKU1234567"
              value={container}
              onChange={(e) => setContainer(e.target.value)}
            />
            <Input
              label="Carrier *"
              placeholder="e.g. Maersk"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Origin *"
              placeholder="e.g. Surabaya, Indonesia"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <Input
              label="Destination *"
              placeholder="e.g. Shanghai, China"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <Input
            label="Port"
            placeholder="e.g. Port of Surabaya"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Product *"
              options={productOptions}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              placeholder="Select product"
            />
            <Input
              label="Quantity (MT) *"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ETD"
              type="date"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
            />
            <Input
              label="ETA"
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </div>

          {formError && (
            <div className="bg-danger/10 border border-danger/20 rounded-md p-3">
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="secondary" onClick={() => { setShowCreateModal(false); setFormError(null); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateShipment} loading={submitting}>
              Create Shipment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
