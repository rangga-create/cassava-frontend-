import { api } from "@/services/api";

export interface ProcessingQuery { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }
export interface PaginatedProcessing { success: boolean; data: any[]; total: number; page: number; limit: number; totalPages: number; }

export const processingService = {
  getAll: async (query?: ProcessingQuery): Promise<PaginatedProcessing> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.processingOrders.list(params);
    return response as unknown as PaginatedProcessing;
  },
  create: async (data: any) => { const r = await api.processingOrders.create(data); return r.data; },
};
