"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Search, Package } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["public-products", search, category, page],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 12 };
      if (search) params.search = search;
      const response = await api.get("/products/public", params);
      return response;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const response = await api.get("/categories/public");
      return response;
    },
  });

  const products = (productsData?.data as any[]) || [];
  const categories = (categoriesData?.data as any[]) || [];

  const categoryFilters = [
    { value: "", label: "All Products" },
    ...categories.map((cat: any) => ({ value: cat.id, label: cat.name })),
    { value: "FRESH", label: "Fresh" },
    { value: "FLOUR", label: "Flour" },
    { value: "CHIPS", label: "Chips" },
    { value: "TAPIOCA_STARCH", label: "Tapioca" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary font-medium text-sm uppercase tracking-wide mb-2">Product Catalog</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Our Products
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Explore our range of premium cassava products. All products are sourced
            from certified farms and meet international quality standards.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {categoryFilters.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  category === cat.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-3 text-sm text-gray-500">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-14 w-14 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
              >
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                  <Package className="h-12 w-12 text-gray-300" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {product.name}
                    </h3>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap font-medium shrink-0">
                      {product.category?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {product.description || "Premium quality cassava product"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-gray-900">
                        {formatCurrency(product.sellingPrice || 0)}
                      </p>
                      <p className="text-xs text-gray-400">per {product.unit || "MT"}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      product.status === "ACTIVE"
                        ? "bg-success/10 text-success"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {product.status === "ACTIVE" ? "In Stock" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {productsData && (productsData as any).totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {(productsData as any).totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= (productsData as any).totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
