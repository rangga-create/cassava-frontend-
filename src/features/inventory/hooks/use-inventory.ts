"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService, InventoryQuery, PaginatedInventory } from "../services/inventory.service";

export function useInventory() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: InventoryQuery = { page, limit, search: search || undefined, warehouseId: warehouseId || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, error: queryError, refetch } = useQuery<PaginatedInventory>({
    queryKey: ["inventory", queryParams],
    queryFn: () => inventoryService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => inventoryService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }) });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => inventoryService.update(id, data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventory"] }) });

  return {
    inventory: response?.data || [], loading, error: queryError instanceof Error ? queryError.message : null,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setWarehouseId, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createInventory: async (data: any) => createMutation.mutateAsync(data),
    updateInventory: async (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
  };
}
