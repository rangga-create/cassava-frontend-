"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "@/services/api";

// ============================================
// Generic Query Hook
// ============================================

interface UseApiQueryOptions<T>
  extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  url: string;
  params?: Record<string, unknown>;
  enabled?: boolean;
}

export function useApiQuery<T>({
  url,
  params,
  ...options
}: UseApiQueryOptions<T>) {
  return useQuery<T>({
    queryKey: [url, params],
    queryFn: async () => {
      const response = await api.get<T>(url, params);
      return response.data;
    },
    ...options,
  });
}

// ============================================
// Generic Mutation Hooks
// ============================================

interface UseApiPostOptions<T, D>
  extends Omit<UseMutationOptions<T, Error, D>, "mutationFn"> {
  url: string;
  invalidateQueries?: string[][];
}

export function useApiPost<T, D = unknown>({
  url,
  invalidateQueries = [],
  ...options
}: UseApiPostOptions<T, D>) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, D>({
    mutationFn: async (data: D) => {
      const response = await api.post<T>(url, data);
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

interface UseApiPatchOptions<T>
  extends Omit<UseMutationOptions<T, Error, { id: string; data: unknown }>, "mutationFn"> {
  invalidateQueries?: string[][];
}

export function useApiPatch<T>({
  invalidateQueries = [],
  ...options
}: UseApiPatchOptions<T>) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, { id: string; data: unknown }>({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<T>(`/${id}`, data);
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}

interface UseApiDeleteOptions<T>
  extends Omit<UseMutationOptions<T, Error, string>, "mutationFn"> {
  invalidateQueries?: string[][];
}

export function useApiDelete<T = void>({
  invalidateQueries = [],
  ...options
}: UseApiDeleteOptions<T>) {
  const queryClient = useQueryClient();

  return useMutation<T, Error, string>({
    mutationFn: async (id: string) => {
      const response = await api.delete<T>(`/${id}`);
      return response.data;
    },
    onSuccess: (...args) => {
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options.onSuccess?.(...args);
    },
    ...options,
  });
}
