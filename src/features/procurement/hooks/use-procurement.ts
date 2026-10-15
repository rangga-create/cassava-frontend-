"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  procurementService,
  ProcurementQuery,
  PaginatedPurchaseOrders,
} from "../services/procurement.service";
import type { PurchaseOrder } from "@/types";

interface UseProcurementReturn {
  purchaseOrders: PurchaseOrder[];
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
  setStatus: (status: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  refresh: () => Promise<void>;
  createPurchaseOrder: (data: any) => Promise<PurchaseOrder>;
  updatePurchaseOrder: (id: string, data: any) => Promise<PurchaseOrder>;
  updateStatus: (id: string, status: string) => Promise<PurchaseOrder>;
  deletePurchaseOrder: (id: string) => Promise<void>;
}

export function useProcurement(): UseProcurementReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Build query params
  const queryParams: ProcurementQuery = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  };

  // React Query for fetching purchase orders
  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<PaginatedPurchaseOrders>({
    queryKey: ["purchaseOrders", queryParams],
    queryFn: () => procurementService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => procurementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      procurementService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      procurementService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => procurementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });

  const purchaseOrders = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch purchase orders"
    : null;

  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const createPurchaseOrder = useCallback(
    async (data: any) => {
      const result = await createMutation.mutateAsync(data);
      return result;
    },
    [createMutation]
  );

  const updatePurchaseOrder = useCallback(
    async (id: string, data: any) => {
      const result = await updateMutation.mutateAsync({ id, data });
      return result;
    },
    [updateMutation]
  );

  const updateStatus = useCallback(
    async (id: string, status: string) => {
      const result = await updateStatusMutation.mutateAsync({ id, status });
      return result;
    },
    [updateStatusMutation]
  );

  const deletePurchaseOrder = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  return {
    purchaseOrders,
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
    setStatus,
    setSortBy,
    setSortOrder,
    refresh,
    createPurchaseOrder,
    updatePurchaseOrder,
    updateStatus,
    deletePurchaseOrder,
  };
}
