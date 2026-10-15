"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesService, SalesQuery, PaginatedSales } from "../services/sales.service";
import type { SalesOrder } from "@/types";

export function useSales() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: SalesQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, error: queryError, refetch } = useQuery<PaginatedSales>({
    queryKey: ["salesOrders", queryParams],
    queryFn: () => salesService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => salesService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesOrders"] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => salesService.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesOrders"] }) });
  const updateStatusMutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => salesService.updateStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesOrders"] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => salesService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["salesOrders"] }) });

  return {
    salesOrders: response?.data || [], loading, error: queryError instanceof Error ? queryError.message : null,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createSalesOrder: async (data: any) => createMutation.mutateAsync(data),
    updateSalesOrder: async (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    updateStatus: async (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
    deleteSalesOrder: async (id: string) => deleteMutation.mutateAsync(id),
  };
}
