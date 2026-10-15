"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Package, ShoppingBag, Clock, CheckCircle, ArrowRight } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const response = await api.get("/orders", { limit: 10 });
      return response;
    },
  });

  const orders = (ordersData?.data as any[]) || [];
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o: any) =>
    ["COMPLETED", "DELIVERED"].includes(o.status)
  ).length;
  const totalSpent = orders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="bg-primary rounded-lg p-5 text-white">
        <h2 className="text-lg font-bold mb-0.5">Welcome back, {user?.name || "Customer"}!</h2>
        <p className="text-white/80 text-sm">
          Here&apos;s an overview of your orders and account.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-info/10 text-info rounded-md flex items-center justify-center">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-lg font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-warning/10 text-warning rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-lg font-bold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-success/10 text-success rounded-md flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-lg font-bold text-gray-900">{completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 text-primary rounded-md flex items-center justify-center">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Spent</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/shop"
          className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 text-sm">Browse Products</h3>
              <p className="text-xs text-gray-500 mt-1">Explore our product catalog</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>

        <Link
          href="/customer/cart"
          className="bg-white rounded-lg p-5 border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 text-sm">View Cart</h3>
              <p className="text-xs text-gray-500 mt-1">Check your shopping cart</p>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 text-sm">Recent Orders</h3>
          <Link href="/customer/orders" className="text-xs text-primary hover:text-primary-dark font-medium">
            View All
          </Link>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No orders yet</p>
            <Link href="/shop" className="text-primary text-xs mt-2 inline-block font-medium">
              Browse products to get started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{order.items?.length || 0} item(s)</td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {formatCurrency(order.grandTotal || 0)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        order.status === "COMPLETED" || order.status === "DELIVERED"
                          ? "bg-success/10 text-success"
                          : order.status === "CANCELLED"
                          ? "bg-danger/10 text-danger"
                          : "bg-warning/10 text-warning"
                      }`}>
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
