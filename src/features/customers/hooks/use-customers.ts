"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  customersService,
  CustomersQuery,
  PaginatedCustomers,
} from "../services/customers.service";
import type { Customer } from "@/types";

export function useCustomers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: CustomersQuery = {
    page, limit,
    search: search || undefined,
    country: country || undefined,
    status: status || undefined,
    sortBy, sortOrder,
  };

  const { data: response, isLoading: loading, error: queryError, refetch } = useQuery<PaginatedCustomers>({
    queryKey: ["customers", queryParams],
    queryFn: () => customersService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => customersService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customersService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  return {
    customers: response?.data || [],
    loading,
    error: queryError instanceof Error ? queryError.message : null,
    total: response?.total || 0,
    page, limit, totalPages: response?.totalPages || 1,
    sortBy, sortOrder,
    setPage, setLimit, setSearch, setCountry, setStatus, setSortBy, setSortOrder,
    refresh: async () => { await refetch(); },
    createCustomer: async (data: any) => createMutation.mutateAsync(data),
    updateCustomer: async (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteCustomer: async (id: string) => deleteMutation.mutateAsync(id),
  };
}
