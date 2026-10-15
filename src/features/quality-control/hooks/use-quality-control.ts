"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  qualityControlService,
  QualityControlQuery,
  PaginatedInspections,
} from "../services/quality-control.service";
import type { QualityInspection } from "@/types";

interface UseQualityControlReturn {
  inspections: QualityInspection[];
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
  setResult: (result: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  refresh: () => Promise<void>;
  createInspection: (data: any) => Promise<QualityInspection>;
  updateInspection: (id: string, data: any) => Promise<QualityInspection>;
  calculateScore: (params: any) => { score: number; result: string };
}

export function useQualityControl(): UseQualityControlReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryParams: QualityControlQuery = {
    page,
    limit,
    search: search || undefined,
    result: result || undefined,
    sortBy,
    sortOrder,
  };

  const {
    data: response,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<PaginatedInspections>({
    queryKey: ["qualityInspections", queryParams],
    queryFn: () => qualityControlService.getAll(queryParams),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => qualityControlService.create(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["qualityInspections"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      qualityControlService.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["qualityInspections"] }),
  });

  const inspections = response?.data || [];
  const total = response?.total || 0;
  const totalPages = response?.totalPages || 1;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to fetch inspections"
    : null;

  return {
    inspections,
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
    setResult,
    setSortBy,
    setSortOrder,
    refresh: async () => {
      await refetch();
    },
    createInspection: async (data) => {
      return createMutation.mutateAsync(data);
    },
    updateInspection: async (id, data) => {
      return updateMutation.mutateAsync({ id, data });
    },
    calculateScore: qualityControlService.calculateScore,
  };
}
