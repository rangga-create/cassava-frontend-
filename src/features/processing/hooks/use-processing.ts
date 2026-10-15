"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { processingService, ProcessingQuery, PaginatedProcessing } from "../services/processing.service";

export function useProcessing() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: ProcessingQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, refetch } = useQuery<PaginatedProcessing>({
    queryKey: ["processingOrders", queryParams],
    queryFn: () => processingService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => processingService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["processingOrders"] }) });

  return {
    orders: response?.data || [], loading,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createOrder: async (data: any) => createMutation.mutateAsync(data),
  };
}
