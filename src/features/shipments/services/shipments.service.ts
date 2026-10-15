import { api } from "@/services/api";
import type { Shipment } from "@/types";

export interface ShipmentsQuery { page?: number; limit?: number; search?: string; status?: string; sortBy?: string; sortOrder?: "asc" | "desc"; }
export interface PaginatedShipments { success: boolean; data: Shipment[]; total: number; page: number; limit: number; totalPages: number; }

export const shipmentsService = {
  getAll: async (query?: ShipmentsQuery): Promise<PaginatedShipments> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.shipments.list(params);
    return response as unknown as PaginatedShipments;
  },
  create: async (data: any) => { const r = await api.shipments.create(data); return r.data; },
  updateStatus: async (id: string, status: string) => { const r = await api.shipments.updateStatus(id, status); return r.data; },
};
