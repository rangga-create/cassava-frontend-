"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseService, WarehouseQuery, PaginatedWarehouses } from "../services/warehouse.service";

export function useWarehouse() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: WarehouseQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, refetch } = useQuery<PaginatedWarehouses>({
    queryKey: ["warehouses", queryParams],
    queryFn: () => warehouseService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => warehouseService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }) });

  return {
    warehouses: response?.data || [], loading,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createWarehouse: async (data: any) => createMutation.mutateAsync(data),
  };
}
