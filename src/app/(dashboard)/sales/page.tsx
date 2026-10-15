"use client";
import { useState, useMemo } from "react";
import { useSales } from "@/features/sales";
import { useProducts } from "@/features/products";
import { useCustomers } from "@/features/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Plus, TrendingUp, Search, RefreshCw, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PaymentModal } from "@/components/payment/payment-modal";
import type { SalesOrder } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const INCOTERM_OPTIONS = [
  { value: "", label: "Select Incoterm" },
  { value: "FOB", label: "FOB (Free on Board)" },
  { value: "CIF", label: "CIF (Cost, Insurance, Freight)" },
  { value: "CFR", label: "CFR (Cost and Freight)" },
  { value: "EXW", label: "EXW (Ex Works)" },
  { value: "DDP", label: "DDP (Delivered Duty Paid)" },
];

export default function SalesPage() {
  const { salesOrders, loading, total, page, limit, totalPages, setPage, setSearch, setStatus, setSortBy, setSortOrder, sortBy, sortOrder, refresh, createSalesOrder, deleteSalesOrder, updateStatus } = useSales();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<SalesOrder | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [incoterm, setIncoterm] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const totalRevenue = salesOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const completedOrders = salesOrders.filter((o) => o.status === "COMPLETED").length;

  const customerOptions = [
    { value: "", label: "Select Customer" },
    ...customers.map((c) => ({ value: c.id, label: `${c.companyName} (${c.contactName})` })),
  ];

  const productOptions = [
    { value: "", label: "Select Product" },
    ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku}) - $${p.sellingPrice}/${p.unit}` })),
  ];

  const subtotal = useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const prc = parseFloat(price) || 0;
    return qty * prc;
  }, [quantity, price]);

  const handleCreateOrder = async () => {
    setFormError(null);

    if (!selectedCustomerId) {
      setFormError("Please select a customer");
      return;
    }
    if (!selectedProductId) {
      setFormError("Please select a product");
      return;
    }
    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      setFormError("Quantity must be at least 1");
      return;
    }
    const prc = parseFloat(price);
    if (!price || isNaN(prc) || prc < 0) {
      setFormError("Price is required");
      return;
    }

    try {
      setSubmitting(true);
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
      const selectedProduct = products.find((p) => p.id === selectedProductId);

      await createSalesOrder({
        customerId: selectedCustomerId,
        productId: selectedProductId,
        quantity: qty,
        price: prc,
        currency,
        incoterm: incoterm || undefined,
        paymentTerms: paymentTerms || undefined,
        notes: notes || undefined,
      });

      // Reset form
      setSelectedCustomerId("");
      setSelectedProductId("");
      setQuantity("");
      setPrice("");
      setCurrency("USD");
      setIncoterm("");
      setPaymentTerms("");
      setNotes("");
      setShowCreateModal(false);
      refresh();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to create sales order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Sales Orders</h1>
          <p className="text-sm text-text-secondary">Manage sales orders and customer transactions</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>New Sales Order</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="Total Orders" value={total} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Completed" value={completedOrders} icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Avg Order Value" value={total > 0 ? formatCurrency(totalRevenue / total) : "$0"} icon={<DollarSign className="h-5 w-5" />} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <input type="text" placeholder="Search orders..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))} className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>
        <Select options={STATUS_OPTIONS} value={undefined} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-full sm:w-40" />
        <Button variant="secondary" onClick={refresh}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : salesOrders.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">No sales orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">SO Number</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Customer</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Product</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Quantity</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Total</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Status</th>
                  <th className="text-right px-5 py-2.5 text-xs font-medium text-text-secondary uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {salesOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-background">
                    <td className="px-5 py-3 font-medium text-primary text-sm">{order.soNumber}</td>
                    <td className="px-5 py-3 text-sm">{order.customerName || order.customerId}</td>
                    <td className="px-5 py-3 text-sm">{order.productName || order.productId}</td>
                    <td className="px-5 py-3 text-sm">{order.quantity.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm font-medium">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <select
                        value={order.status}
                        onChange={async (e) => {
                          await updateStatus(order.id, e.target.value);
                          refresh();
                        }}
                        className="text-xs border border-border rounded px-2 py-1 mr-2 bg-surface"
                      >
                        {STATUS_OPTIONS.filter(s => s.value).map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      {order.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedOrderForPayment(order);
                            setShowPaymentModal(true);
                          }}
                          className="mr-2"
                        >
                          💳 Pay
                        </Button>
                      )}
                      <button onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }} className="text-danger hover:text-danger text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border">
          <p className="text-sm text-text-secondary">Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-background disabled:opacity-50">Prev</button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-background disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>

      {/* New Sales Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); setFormError(null); }} title="New Sales Order" description="Create a new sales order" size="lg">
        <div className="space-y-4">
          <Select
            label="Customer *"
            options={customerOptions}
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            placeholder="Select a customer"
          />

          <Select
            label="Product *"
            options={productOptions}
            value={selectedProductId}
            onChange={(e) => {
              setSelectedProductId(e.target.value);
              const p = products.find((pr) => pr.id === e.target.value);
              if (p) setPrice(String(p.sellingPrice));
            }}
            placeholder="Select a product"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Quantity *"
              type="number"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              step="any"
            />
            <Input
              label="Price per Unit *"
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="any"
            />
            <Select
              label="Currency"
              options={[
                { value: "USD", label: "USD" },
                { value: "IDR", label: "IDR" },
                { value: "EUR", label: "EUR" },
                { value: "JPY", label: "JPY" },
                { value: "CNY", label: "CNY" },
              ]}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>

          {/* Subtotal Preview */}
          {subtotal > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 flex justify-between items-center">
              <span className="text-sm text-text-secondary">Subtotal</span>
              <span className="text-lg font-bold text-primary">{formatCurrency(subtotal, currency)}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Incoterm"
              options={INCOTERM_OPTIONS}
              value={incoterm}
              onChange={(e) => setIncoterm(e.target.value)}
            />
            <Input
              label="Payment Terms"
              placeholder="e.g. Net 30"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            />
          </div>

          <Input
            label="Notes"
            placeholder="Optional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
              Create Sales Order
            </Button>
          </div>
        </div>
      </Modal>

      {selectedOrderForPayment && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrderForPayment(null);
          }}
          order={selectedOrderForPayment}
        />
      )}

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedOrder(null); }} title="Delete Sales Order">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Are you sure you want to delete <strong>{selectedOrder?.soNumber}</strong>?</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setSelectedOrder(null); }}>Cancel</Button>
            <Button variant="danger" onClick={async () => { setSubmitting(true); await deleteSalesOrder(selectedOrder!.id); setShowDeleteModal(false); setSelectedOrder(null); setSubmitting(false); }} loading={submitting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
