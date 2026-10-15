"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Package, CheckCircle, CreditCard, Truck } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  const [formData, setFormData] = useState({
    shippingAddress: "",
    billingAddress: "",
    contactPhone: "",
    contactEmail: user?.email || "",
    notes: "",
    paymentMethod: "bank_transfer",
    shippingMethod: "standard",
  });

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response;
    },
  });

  const cart = (cartData?.data as any) || { items: [], totalItems: 0, totalAmount: 0 };
  const items = cart.items || [];

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post("/orders", orderData);
      return response;
    },
    onSuccess: (response: any) => {
      setOrderId(response.data?.orderNumber || "ORD-" + Date.now());
      setOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    const orderData = {
      customerId: user?.uid || "",
      customerName: user?.name || "Customer",
      items: items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit || "MT",
      })),
      shippingAddress: formData.shippingAddress,
      billingAddress: formData.billingAddress || formData.shippingAddress,
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod,
      shippingMethod: formData.shippingMethod,
    };
    createOrderMutation.mutate(orderData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (orderPlaced) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-10">
          <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order Placed!</h2>
          <p className="text-gray-500 text-sm mb-2">Your order has been placed successfully.</p>
          <p className="text-base font-semibold text-primary mb-5">Order Number: {orderId}</p>
          <p className="text-sm text-gray-500 mb-6">
            You will receive a notification once your order is confirmed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/customer/orders"
              className="bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-14 w-14 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <Link href="/shop" className="text-primary font-medium text-sm hover:text-primary-dark">
          Browse products to get started
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/customer/cart" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Cart
        </Link>
        <h2 className="text-lg font-bold text-gray-900">Checkout</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" /> Shipping Address
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea
                    name="shippingAddress"
                    required
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    placeholder="Street address, city, country"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" name="contactPhone" required value={formData.contactPhone} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="+62 812 3456 7890" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" name="contactEmail" required value={formData.contactEmail} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 text-sm mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Payment Method
              </h3>
              <div className="space-y-2">
                {[
                  { value: "bank_transfer", label: "Bank Transfer", desc: "Transfer to our bank account" },
                  { value: "credit_card", label: "Credit Card", desc: "Pay with credit card" },
                  { value: "cash_on_delivery", label: "Cash on Delivery", desc: "Pay when you receive" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                      formData.paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-medium text-gray-900 text-sm mb-3">Order Notes</h3>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                placeholder="Any special instructions or requirements..."
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
              <h3 className="font-medium text-gray-900 text-sm mb-3">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {items.map((item: any) => (
                  <div key={item.productId} className="flex items-center gap-2.5 text-sm">
                    <div className="w-9 h-9 bg-gray-100 rounded flex items-center justify-center shrink-0">
                      <Package className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-xs truncate">{item.productName}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900 text-xs">
                      {formatCurrency(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(cart.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-400">TBD</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">{formatCurrency(cart.totalAmount || 0)}</span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="w-full bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors mt-5 disabled:opacity-50"
              >
                {createOrderMutation.isPending ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
