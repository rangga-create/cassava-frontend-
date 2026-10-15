import { api } from "@/services/api";
import type { PurchaseOrder } from "@/types";

// ============================================
// Procurement Service
// ============================================

export interface ProcurementQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supplierId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPurchaseOrders {
  success: boolean;
  data: PurchaseOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export interface CreatePurchaseOrderInput {
  supplierId: string;
  supplierName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unit: string;
  price: number;
  expectedDelivery?: string;
  paymentTerms?: string;
  notes?: string;
}

export const procurementService = {
  /**
   * Get all purchase orders with pagination and filters
   */
  getAll: async (query?: ProcurementQuery): Promise<PaginatedPurchaseOrders> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.supplierId) params.supplierId = query.supplierId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.purchaseOrders.list(params);
    return response as unknown as PaginatedPurchaseOrders;
  },

  /**
   * Get purchase order by ID
   */
  getById: async (id: string): Promise<PurchaseOrder> => {
    const response = await api.purchaseOrders.get(id);
    return response.data as PurchaseOrder;
  },

  /**
   * Create a new purchase order
   */
  create: async (data: CreatePurchaseOrderInput): Promise<PurchaseOrder> => {
    const response = await api.purchaseOrders.create(data);
    return response.data as PurchaseOrder;
  },

  /**
   * Update a purchase order
   */
  update: async (id: string, data: Partial<CreatePurchaseOrderInput>): Promise<PurchaseOrder> => {
    const response = await api.purchaseOrders.update(id, data);
    return response.data as PurchaseOrder;
  },

  /**
   * Update purchase order status
   */
  updateStatus: async (id: string, status: string): Promise<PurchaseOrder> => {
    const response = await api.purchaseOrders.updateStatus(id, status);
    return response.data as PurchaseOrder;
  },

  /**
   * Delete a purchase order
   */
  delete: async (id: string): Promise<void> => {
    await api.purchaseOrders.delete(id);
  },
};
