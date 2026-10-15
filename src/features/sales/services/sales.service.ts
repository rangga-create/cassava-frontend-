import { api } from "@/services/api";
import type { SalesOrder } from "@/types";

export interface SalesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSales {
  success: boolean;
  data: SalesOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const salesService = {
  getAll: async (query?: SalesQuery): Promise<PaginatedSales> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.customerId) params.customerId = query.customerId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;
    const response = await api.salesOrders.list(params);
    return response as unknown as PaginatedSales;
  },
  getById: async (id: string): Promise<SalesOrder> => {
    const response = await api.salesOrders.get(id);
    return response.data as SalesOrder;
  },
  create: async (data: any): Promise<SalesOrder> => {
    const response = await api.salesOrders.create(data);
    return response.data as SalesOrder;
  },
  update: async (id: string, data: any): Promise<SalesOrder> => {
    const response = await api.salesOrders.update(id, data);
    return response.data as SalesOrder;
  },
  updateStatus: async (id: string, status: string): Promise<SalesOrder> => {
    const response = await api.salesOrders.updateStatus(id, status);
    return response.data as SalesOrder;
  },
  delete: async (id: string): Promise<void> => {
    await api.salesOrders.delete(id);
  },
};
