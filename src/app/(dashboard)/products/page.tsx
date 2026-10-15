"use client";

import { useState } from "react";
import { useProducts } from "@/features/products";
import { ProductsTable } from "@/features/products";
import { ProductForm } from "@/features/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { KPICard } from "@/components/ui/card";
import { Plus, Package, Search, Download, RefreshCw } from "lucide-react";
import type { Product } from "@/types";
import type { ProductInput } from "@/lib/validations";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "FRESH", label: "Fresh Cassava" },
  { value: "DRIED", label: "Dried Cassava" },
  { value: "CHIPS", label: "Cassava Chips" },
  { value: "FLOUR", label: "Cassava Flour" },
  { value: "TAPIOCA_STARCH", label: "Tapioca Starch" },
  { value: "PELLETS", label: "Cassava Pellets" },
  { value: "FROZEN", label: "Frozen Cassava" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISCONTINUED", label: "Discontinued" },
];

export default function ProductsPage() {
  const {
    products,
    loading,
    total,
    page,
    limit,
    totalPages,
    setPage,
    setSearch,
    setCategory,
    setStatus,
    setSortBy,
    setSortOrder,
    sortBy,
    sortOrder,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const avgMargin =
    products.length > 0
      ? products.reduce((sum, p) => sum + p.margin, 0) / products.length
      : 0;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleCreate = async (data: ProductInput) => {
    try {
      setSubmitting(true);
      await createProduct(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: ProductInput) => {
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      await updateProduct(selectedProduct.id, data);
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Failed to update product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct.id);
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Products</h1>
          <p className="text-sm text-text-secondary">
            Manage your Indocassava products catalog
          </p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreateModal(true)}>
          Add Product
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Products"
          value={total}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Active Products"
          value={activeProducts}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Total Stock"
          value={`${totalStock.toLocaleString()} MT`}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          icon={<Package className="h-5 w-5" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        <Select
          options={CATEGORY_OPTIONS}
          value={undefined}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        />
        <Select
          options={STATUS_OPTIONS}
          value={undefined}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-40"
        />
        <Button variant="secondary" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      {/* Products Table */}
      <ProductsTable
        products={products}
        loading={loading}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onPageChange={setPage}
        onView={(product) => {
          console.log("View product:", product);
        }}
        onEdit={(product) => {
          setSelectedProduct(product);
          setShowEditModal(true);
        }}
        onDelete={(product) => {
          setSelectedProduct(product);
          setShowDeleteModal(true);
        }}
      />

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Product"
        description="Create a new product in your catalog"
        size="lg"
      >
        <ProductForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={submitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        title="Edit Product"
        description="Update product information"
        size="lg"
      >
        {selectedProduct && (
          <ProductForm
            product={selectedProduct}
            onSubmit={handleEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
            loading={submitting}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={submitting}
            >
              Delete Product
            </Button>
          </>
        }
      >
        {selectedProduct && (
          <div className="py-2">
            <p className="text-sm text-text-secondary">
              You are about to delete:
            </p>
            <p className="mt-2 font-medium text-text">
              {selectedProduct.name} ({selectedProduct.sku})
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
