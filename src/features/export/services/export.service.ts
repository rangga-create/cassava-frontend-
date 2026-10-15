import { api } from "@/services/api";
import type { ExportOrder } from "@/types";

export interface ExportQuery { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }
export interface PaginatedExports { success: boolean; data: ExportOrder[]; total: number; page: number; limit: number; totalPages: number; }

export const exportService = {
  getAll: async (query?: ExportQuery): Promise<PaginatedExports> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.exportOrders.list(params);
    return response as unknown as PaginatedExports;
  },
  create: async (data: any) => { const r = await api.exportOrders.create(data); return r.data; },
  updateStatus: async (id: string, status: string) => { const r = await api.exportOrders.updateStatus(id, status); return r.data; },
};
