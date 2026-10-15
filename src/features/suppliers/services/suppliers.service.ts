import { api } from "@/services/api";
import type { SupplierInput } from "@/lib/validations";
import type { Supplier, SupplierPerformance } from "@/types";

// ============================================
// Suppliers Service
// ============================================

export interface SuppliersQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSuppliers {
  success: boolean;
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export const suppliersService = {
  /**
   * Get all suppliers with pagination and filters
   */
  getAll: async (query?: SuppliersQuery): Promise<PaginatedSuppliers> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.country) params.country = query.country;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.suppliers.list(params);
    return response as unknown as PaginatedSuppliers;
  },

  /**
   * Get supplier by ID
   */
  getById: async (id: string): Promise<Supplier> => {
    const response = await api.suppliers.get(id);
    return response.data as Supplier;
  },

  /**
   * Get supplier performance metrics
   */
  getPerformance: async (id: string): Promise<SupplierPerformance> => {
    const response = await api.suppliers.performance(id);
    return response.data as SupplierPerformance;
  },

  /**
   * Create a new supplier
   */
  create: async (data: SupplierInput): Promise<Supplier> => {
    const response = await api.suppliers.create(data);
    return response.data as Supplier;
  },

  /**
   * Update an existing supplier
   */
  update: async (id: string, data: Partial<SupplierInput>): Promise<Supplier> => {
    const response = await api.suppliers.update(id, data);
    return response.data as Supplier;
  },

  /**
   * Delete a supplier
   */
  delete: async (id: string): Promise<void> => {
    await api.suppliers.delete(id);
  },
};
