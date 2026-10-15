"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shipmentsService, ShipmentsQuery, PaginatedShipments } from "../services/shipments.service";

export function useShipments() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: ShipmentsQuery = { page, limit, search: search || undefined, status: status || undefined, sortBy, sortOrder };

  const { data: response, isLoading: loading, refetch } = useQuery<PaginatedShipments>({
    queryKey: ["shipments", queryParams],
    queryFn: () => shipmentsService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({ mutationFn: (data: any) => shipmentsService.create(data), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipments"] }) });
  const updateStatusMutation = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => shipmentsService.updateStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shipments"] }) });

  return {
    shipments: response?.data || [], loading,
    total: response?.total || 0, page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder, setPage, setLimit, setSearch, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createShipment: async (data: any) => createMutation.mutateAsync(data),
    updateStatus: async (id: string, status: string) => updateStatusMutation.mutateAsync({ id, status }),
  };
}
