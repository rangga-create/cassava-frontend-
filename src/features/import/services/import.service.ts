import { api } from "@/services/api";
import type { ImportOrder } from "@/types";

export interface ImportQuery { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }
export interface PaginatedImports { success: boolean; data: ImportOrder[]; total: number; page: number; limit: number; totalPages: number; }

export const importService = {
  getAll: async (query?: ImportQuery): Promise<PaginatedImports> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.importOrders.list(params);
    return response as unknown as PaginatedImports;
  },
  create: async (data: any) => { const r = await api.importOrders.create(data); return r.data; },
};
