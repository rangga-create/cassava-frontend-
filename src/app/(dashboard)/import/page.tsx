"use client";
import { useState, useMemo } from "react";
import { useImport } from "@/features/import";
import { useProducts } from "@/features/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, Globe, Search, RefreshCw, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ImportPage() {
  const { importOrders, loading, total, page, limit, totalPages, setPage, setSearch, refresh, createImportOrder } = useImport();
  const { products } = useProducts();
  const [searchInput, setSearchInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [supplierName, setSupplierName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [country, setCountry] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseValue, setPurchaseValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [freight, setFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [customs, setCustoms] = useState("");
  const [tax, setTax] = useState("");
  const [handling, setHandling] = useState("");
  const [eta, setEta] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const totalValue = importOrders.reduce((sum, o) => sum + (o.purchaseValue || 0), 0);
  const totalLandedCost = importOrders.reduce((sum, o) => sum + (o.landedCost || 0), 0);

  const landedCostPreview = useMemo(() => {
    const pv = parseFloat(purchaseValue) || 0;
    const fr = parseFloat(freight) || 0;
    const ins = parseFloat(insurance) || 0;
    const cu = parseFloat(customs) || 0;
    const tx = parseFloat(tax) || 0;
    const ha = parseFloat(handling) || 0;
    return pv + fr + ins + cu + tx + ha;
  }, [purchaseValue, freight, insurance, customs, tax, handling]);

  const productOptions = [
    { value: "", label: "Select Product" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` })),
  ];

  const handleCreateOrder = async () => {
    setFormError(null);

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
    const pv = parseFloat(purchaseValue);
    if (!purchaseValue || isNaN(pv) || pv < 0) {
      setFormError("Purchase value is required");
      return;
    }

    try {
      setSubmitting(true);

      await createImportOrder({
        supplierName: supplierName || undefined,
        country,
        productId: selectedProductId,
        quantity: qty,
        purchaseValue: pv,
        currency,
        freight: freight ? parseFloat(freight) : 0,
        insurance: insurance ? parseFloat(insurance) : 0,
        customs: customs ? parseFloat(customs) : 0,
        tax: tax ? parseFloat(tax) : 0,
        handling: handling ? parseFloat(handling) : 0,
        eta: eta || undefined,
      });

      // Reset form
      setSupplierName("");
      setSelectedProductId("");
      setCountry("");
      setQuantity("");
      setPurchaseValue("");
      setCurrency("USD");
      setFreight("");
      setInsurance("");
      setCustoms("");
      setTax("");
      setHandling("");
      setEta("");
      setShowCreateModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create import order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Import Orders</h1>
          <p className="text-text-secondary">Manage international import orders and landed costs</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>New Import Order</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Imports" value={total} icon={<Globe className="h-5 w-5" />} />
        <KPICard title="Purchase Value" value={formatCurrency(totalValue)} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Total Landed Cost" value={formatCurrency(totalLandedCost)} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Avg per Order" value={total > 0 ? formatCurrency(totalLandedCost / total) : "$0"} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <Card padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input type="text" placeholder="Search import orders..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
          </div>
          <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </Card>

      <Card padding="none">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : importOrders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">No import orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Supplier</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Country</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Product</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Quantity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Value</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Landed Cost</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">ETA</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {importOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background">
                    <td className="px-5 py-3 text-sm font-medium">{order.supplierName || order.supplierId}</td>
                    <td className="px-5 py-3 text-sm">{order.country}</td>
                    <td className="px-5 py-3 text-sm">{order.productName || order.productId}</td>
                    <td className="px-5 py-3 text-sm">{order.quantity.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">{formatCurrency(order.purchaseValue)}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(order.landedCost)}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{order.eta ? new Date(order.eta).toLocaleDateString() : "-"}</td>
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

      {/* New Import Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormError(null); }} title="New Import Order" description="Create a new import order" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              placeholder="e.g. Thai Indocassava Corp"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
            <Input
              label="Country *"
              placeholder="e.g. Thailand"
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
              label="Purchase Value *"
              type="number"
              placeholder="0"
              value={purchaseValue}
              onChange={(e) => setPurchaseValue(e.target.value)}
              min="0"
              step="any"
            />
            <Select
              label="Currency"
              options={[
                { value: "USD", label: "USD" },
                { value: "IDR", label: "IDR" },
                { value: "EUR", label: "EUR" },
                { value: "THB", label: "THB" },
              ]}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Additional Costs</p>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Freight"
              type="number"
              placeholder="0"
              value={freight}
              onChange={(e) => setFreight(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Insurance"
              type="number"
              placeholder="0"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Customs"
              type="number"
              placeholder="0"
              value={customs}
              onChange={(e) => setCustoms(e.target.value)}
              min="0"
              step="any"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Tax"
              type="number"
              placeholder="0"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="Handling"
              type="number"
              placeholder="0"
              value={handling}
              onChange={(e) => setHandling(e.target.value)}
              min="0"
              step="any"
            />
            <Input
              label="ETA"
              type="date"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
            />
          </div>

          {/* Landed Cost Preview */}
          {landedCostPreview > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex justify-between items-center">
              <span className="text-sm text-text-secondary">Landed Cost (auto-calculated)</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(landedCostPreview, currency)}</span>
            </div>
          )}

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
              Create Import Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
