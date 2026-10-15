import { api } from "@/services/api";
import type { Inventory } from "@/types";

export interface InventoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedInventory {
  success: boolean;
  data: Inventory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const inventoryService = {
  getAll: async (query?: InventoryQuery): Promise<PaginatedInventory> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.warehouseId) params.warehouseId = query.warehouseId;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.inventory.list(params);
    return response as unknown as PaginatedInventory;
  },
  create: async (data: any) => { const r = await api.inventory.create(data); return r.data; },
  update: async (id: string, data: any) => { const r = await api.inventory.update(id, data); return r.data; },
};
