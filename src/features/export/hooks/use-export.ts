"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exportService, ExportQuery, PaginatedExports } from "../services/export.service";

export function useExport() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: ExportQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, refetch } = useQuery<PaginatedExports>({
    queryKey: ["exportOrders", queryParams],
    queryFn: () => exportService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => exportService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exportOrders"] }) });
  const updateStatusMutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => exportService.updateStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exportOrders"] }) });

  return {
    exportOrders: response?.data || [], loading,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createExportOrder: async (data: any) => createMutation.mutateAsync(data),
    updateStatus: async (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
  };
}
