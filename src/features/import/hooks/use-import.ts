"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { importService, ImportQuery, PaginatedImports } from "../services/import.service";

export function useImport() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: ImportQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, refetch } = useQuery<PaginatedImports>({
    queryKey: ["importOrders", queryParams],
    queryFn: () => importService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => importService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["importOrders"] }) });

  return {
    importOrders: response?.data || [], loading,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createImportOrder: async (data: any) => createMutation.mutateAsync(data),
  };
}
