"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  suppliersService,
  SuppliersQuery,
  PaginatedSuppliers,
} from "../services/suppliers.service";
import type { Supplier } from "@/types";

interface UseSuppliersReturn {
  suppliers: Supplier[];
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
  setCountry: (country: string) => void;
  setStatus: (status: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  refresh: () => Promise<void>;
  createSupplier: (data: any) => Promise<Supplier>;
  updateSupplier: (id: string, data: any) => Promise<Supplier>;
  deleteSupplier: (id: string) => Promise<void>;
}

export function useSuppliers(): UseSuppliersReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: SuppliersQuery = {
    page,
    limit,
    search: search || undefined,
    country: country || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<PaginatedSuppliers>({
    queryKey: ["suppliers", queryParams],
    queryFn: () => suppliersService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => suppliersService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      suppliersService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  const suppliers = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch suppliers"
    : null;

  return {
    suppliers,
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
    setCountry,
    setStatus,
    setSortBy,
    setSortOrder,
    refresh: async () => {
      await refetch();
    },
    createSupplier: async (data) => {
      return createMutation.mutateAsync(data);
    },
    updateSupplier: async (id, data) => {
      return updateMutation.mutateAsync({ id, data });
    },
    deleteSupplier: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
