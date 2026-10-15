"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productsService,
  ProductsQuery,
  PaginatedProducts,
} from "../services/products.service";
import type { Product } from "@/types";

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setStatus: (status: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  refresh: () => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: string, data: any) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
}

export function useProducts(): UseProductsReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Build query params
  const queryParams: ProductsQuery = {
    page,
    limit,
    search: search || undefined,
    category: category || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  };

  // React Query for fetching products
  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<PaginatedProducts>({
    queryKey: ["products", queryParams],
    queryFn: () => productsService.getAll(queryParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const products = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch products"
    : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createProduct = useCallback(
    async (data: any) => {
      const result = await createMutation.mutateAsync(data);
      return result;
    },
    [createMutation]
  );

  const updateProduct = useCallback(
    async (id: string, data: any) => {
      const result = await updateMutation.mutateAsync({ id, data });
      return result;
    },
    [updateMutation]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    products,
    loading,
    error,
    total,
    page,
    limit,
    totalPages,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    setCategory,
    setStatus,
    setSortBy,
    setSortOrder,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
