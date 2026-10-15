"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  companiesService,
  CompaniesQuery,
  PaginatedCompanies,
} from "../services/companies.service";
import type { Company } from "@/types";

interface UseCompaniesReturn {
  companies: Company[];
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
  createCompany: (data: any) => Promise<Company>;
  updateCompany: (id: string, data: any) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
}

export function useCompanies(): UseCompaniesReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: CompaniesQuery = {
    page,
    limit,
    search: search || undefined,
    status: status || undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<PaginatedCompanies>({
    queryKey: ["companies", queryParams],
    queryFn: () => companiesService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => companiesService.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      companiesService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => companiesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }),
  });

  const companies = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch companies"
    : null;

  return {
    companies,
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
    refresh: async () => {
      await refetch();
    },
    createCompany: async (data) => {
      return createMutation.mutateAsync(data);
    },
    updateCompany: async (id, data) => {
      return updateMutation.mutateAsync({ id, data });
    },
    deleteCompany: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
