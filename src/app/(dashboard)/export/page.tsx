"use client";
import { useState } from "react";
import { useExport } from "@/features/export";
import { useProducts } from "@/features/products";
import { useCustomers } from "@/features/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Globe, Search, RefreshCw, DollarSign, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "PREPARING", label: "Preparing" },
  { value: "DOCUMENTATION", label: "Documentation" },
  { value: "CUSTOMS", label: "Customs" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
];

const INCOTERM_OPTIONS = [
  { value: "", label: "Select Incoterm" },
  { value: "FOB", label: "FOB (Free on Board)" },
  { value: "CIF", label: "CIF (Cost, Insurance, Freight)" },
  { value: "CFR", label: "CFR (Cost and Freight)" },
  { value: "EXW", label: "EXW (Ex Works)" },
  { value: "DDP", label: "DDP (Delivered Duty Paid)" },
];

export default function ExportPage() {
  const { exportOrders, loading, total, page, limit, totalPages, setPage, setSearch, setStatus, refresh, createExportOrder } = useExport();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [searchInput, setSearchInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [country, setCountry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [incoterm, setIncoterm] = useState("FOB");
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDestination, setPortOfDestination] = useState("");
  const [etd, setEtd] = useState("");
  const [eta, setEta] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const totalValue = exportOrders.reduce((sum, o) => sum + (o.value || 0), 0);
  const inTransit = exportOrders.filter((o) => o.status === "IN_TRANSIT").length;

  const buyerOptions = [
    { value: "", label: "Select Buyer" },
    ...customers.map((c) => ({ value: c.id, label: `${c.companyName} (${c.country})` })),
  ];

  const productOptions = [
    { value: "", label: "Select Product" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ];

  const handleCreateOrder = async () => {
    setFormError(null);

    if (!selectedBuyerId) {
      setFormError("Please select a buyer");
      return;
    }
    if (!selectedProductId) {
      setFormError("Please select a product");
      return;
    }
    if (!country.trim()) {
      setFormError("Country is required");
      return;
    }
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setFormError("Quantity must be a positive number");
      return;
    }
    const val = parseFloat(value);
    if (!value || isNaN(val) || val <= 0) {
      setFormError("Export value must be a positive number");
      return;
    }
    if (!portOfLoading.trim()) {
      setFormError("Port of loading is required");
      return;
    }
    if (!portOfDestination.trim()) {
      setFormError("Port of destination is required");
      return;
    }

    try {
      setSubmitting(true);
      const selectedCustomer = customers.find((c) => c.id === selectedBuyerId);
      const selectedProduct = products.find((p) => p.id === selectedProductId);

      await createExportOrder({
        salesOrderId: "",
        buyerId: selectedBuyerId,
        buyerName: selectedCustomer?.companyName || "",
        country,
        productId: selectedProductId,
        productName: selectedProduct?.name || "",
        quantity: qty,
        value: val,
        currency,
        incoterm: incoterm || "FOB",
        portOfLoading,
        portOfDestination,
        etd: etd || undefined,
        eta: eta || undefined,
        documents: [],
      });

      // Reset form
      setSelectedBuyerId("");
      setSelectedProductId("");
      setCountry("");
      setQuantity("");
      setValue("");
      setCurrency("USD");
      setIncoterm("FOB");
      setPortOfLoading("");
      setPortOfDestination("");
      setEtd("");
      setEta("");
      setShowCreateModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create export order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Export Orders</h1>
          <p className="text-text-secondary">Manage international export orders and documentation</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>New Export Order</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Exports" value={total} icon={<Globe className="h-5 w-5" />} />
        <KPICard title="Total Value" value={formatCurrency(totalValue)} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="In Transit" value={inTransit} icon={<Truck className="h-5 w-5" />} />
        <KPICard title="Delivered" value={exportOrders.filter((o) => o.status === "DELIVERED").length} icon={<Globe className="h-5 w-5" />} />
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input type="text" placeholder="Search export orders..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
          <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : exportOrders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No export orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Country</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Product</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Quantity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Value</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Incoterm</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">ETD</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exportOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background">
                    <td className="px-5 py-3 font-medium">{order.country}</td>
                    <td className="px-5 py-3 text-sm">{order.productName || order.productId}</td>
                    <td className="px-5 py-3 text-sm">{order.quantity.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(order.value)}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{order.incoterm}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{order.etd ? new Date(order.etd).toLocaleDateString() : "-"}</td>
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

      {/* New Export Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormError(null); }} title="New Export Order" description="Create a new export order" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Buyer/Partner *"
              options={buyerOptions}
              value={selectedBuyerId}
              onChange={(e) => setSelectedBuyerId(e.target.value)}
              placeholder="Select buyer"
            />
            <Input
              label="Country *"
              placeholder="e.g. China"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <Select
            label="Product *"
            options={productOptions}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Select product"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quantity (MT) *"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Value *"
              type="number"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min="0"
              step="any"
            />
            <Select
              label="Currency"
              options={[
                { value: "USD", label: "USD" },
                { value: "IDR", label: "IDR" },
                { value: "EUR", label: "EUR" },
              ]}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Incoterm"
              options={INCOTERM_OPTIONS}
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
            />
            <Input
              label="Port of Loading *"
              placeholder="e.g. Port of Surabaya"
              value={portOfLoading}
              onChange={(e) => setPortOfLoading(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Port of Destination *"
              placeholder="e.g. Port of Shanghai"
              value={portOfDestination}
              onChange={(e) => setPortOfDestination(e.target.value)}
            />
            <div />
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
            <Button onClick={handleCreateOrder} loading={submitting}>
              Create Export Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
