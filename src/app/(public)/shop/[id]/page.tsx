"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { Package, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: productData, isLoading } = useQuery({
    queryKey: ["public-product", params.id],
    queryFn: async () => {
      const response = await api.get(`/products/public/${params.id}`);
      return response;
    },
    enabled: !!params.id,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; productName: string; price: number }) => {
      const response = await api.post("/cart/items", data);
      return response;
    },
    onSuccess: () => {
      setAddedToCart(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setTimeout(() => setAddedToCart(false), 3000);
    },
  });

  const product = productData?.data as any;

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      productName: product.name,
      price: product.sellingPrice || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <AlertCircle className="h-14 w-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Product not found</p>
          <Link href="/shop" className="text-primary mt-3 inline-block text-sm font-medium hover:text-primary-dark">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-primary">Products</Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <Package className="h-28 w-28 text-gray-300" />
        </div>

        {/* Product Info */}
        <div>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
            {product.category?.replace(/_/g, " ")}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-1">{product.name}</h1>

          <p className="text-sm text-gray-500 mb-4">
            SKU: {product.sku} | Grade: {product.grade}
          </p>

          <p className="text-gray-600 mb-5 text-sm leading-relaxed">
            {product.description || "Premium quality cassava product sourced from certified farms in Indonesia."}
          </p>

          <div className="border-t border-b border-gray-200 py-4 mb-5">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(product.sellingPrice || 0)}
              <span className="text-sm font-normal text-gray-500 ml-2">per {product.unit || "MT"}</span>
            </p>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <p className="text-xs text-gray-500">Origin</p>
              <p className="font-medium text-sm">{product.origin || "Indonesia"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Unit</p>
              <p className="font-medium text-sm">{product.unit || "MT"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-medium text-sm">
                <span className={`inline-flex items-center gap-1 ${
                  product.status === "ACTIVE" ? "text-success" : "text-gray-500"
                }`}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  {product.status === "ACTIVE" ? "Available" : "Unavailable"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Margin</p>
              <p className="font-medium text-sm">{product.margin || 0}%</p>
            </div>
          </div>

          {/* Add to Cart */}
          {user?.role === "CUSTOMER" && product.status === "ACTIVE" && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  -
                </button>
                <span className="px-3 py-2 font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-50 text-sm"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-md font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {addToCartMutation.isPending ? (
                  "Adding..."
                ) : addedToCart ? (
                  <>
                    <CheckCircle className="h-4 w-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          {/* Login prompt for non-customers */}
          {!user && (
            <div className="bg-gray-50 rounded-md p-4 mb-5 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Want to order this product?
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Sign In to Order
              </Link>
            </div>
          )}

          {/* Contact Sales */}
          <Link
            href="/contact"
            className="block text-center border border-gray-300 text-gray-700 px-5 py-2.5 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Contact Sales for Bulk Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
