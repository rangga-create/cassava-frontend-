import { api } from "@/services/api";
import type { Warehouse } from "@/types";

export interface WarehouseQuery { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }
export interface PaginatedWarehouses { success: boolean; data: Warehouse[]; total: number; page: number; limit: number; totalPages: number; }

export const warehouseService = {
  getAll: async (query?: WarehouseQuery): Promise<PaginatedWarehouses> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.warehouses.list(params);
    return response as unknown as PaginatedWarehouses;
  },
  create: async (data: any) => { const r = await api.warehouses.create(data); return r.data; },
  update: async (id: string, data: any) => { const r = await api.warehouses.update(id, data); return r.data; },
  metrics: async (id: string) => { const r = await api.warehouses.metrics(id); return r.data; },
};
