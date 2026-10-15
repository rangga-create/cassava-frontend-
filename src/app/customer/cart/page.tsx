"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CustomerCartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response;
    },
  });

  const cart = (cartData?.data as any) || { items: [], totalItems: 0, totalAmount: 0 };
  const items = cart.items || [];

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await api.patch(`/cart/items/${productId}`, { quantity });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/cart/items/${productId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantityMutation.mutate({ productId, quantity: newQuantity });
  };

  const handleRemove = (productId: string) => {
    removeItemMutation.mutate(productId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
        <p className="text-gray-500 text-sm">{items.length} item(s) in your cart</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center">
          <ShoppingCart className="h-14 w-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item: any) => (
              <div
                key={item.productId}
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
                  <Package className="h-7 w-7 text-gray-300" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm truncate">{item.productName}</h3>
                  <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                    disabled={updateQuantityMutation.isPending}
                    className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900 text-sm">
                    {formatCurrency(item.quantity * item.price)}
                  </p>
                </div>

                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={removeItemMutation.isPending}
                  className="p-1.5 text-gray-400 hover:text-danger hover:bg-danger/5 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-24">
              <h3 className="font-medium text-gray-900 text-sm mb-4">Order Summary</h3>

              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items ({items.length})</span>
                  <span className="text-gray-900">{formatCurrency(cart.totalAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-2.5">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(cart.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/customer/checkout"
                className="block w-full bg-primary text-white text-center px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="block w-full text-center text-primary text-sm mt-2.5 hover:text-primary-dark font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
