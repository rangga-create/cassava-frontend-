import { api } from "@/services/api";
import type { QualityInspection } from "@/types";

// ============================================
// Quality Control Service
// ============================================

export interface QualityControlQuery {
  page?: number;
  limit?: number;
  search?: string;
  result?: string;
  batchId?: string;
  supplierId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedInspections {
  success: boolean;
  data: QualityInspection[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export interface CreateInspectionInput {
  batchId: string;
  batchNumber?: string;
  supplierId: string;
  supplierName?: string;
  purchaseOrderId?: string;
  productId: string;
  productName?: string;
  warehouseId?: string;
  moisture: number;
  starchContent: number;
  impurity: number;
  damage: number;
  color: string;
  size: string;
  freshness: number;
  grade: string;
  notes?: string;
}

export const qualityControlService = {
  /**
   * Get all quality inspections with pagination and filters
   */
  getAll: async (query?: QualityControlQuery): Promise<PaginatedInspections> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.result) params.result = query.result;
    if (query?.batchId) params.batchId = query.batchId;
    if (query?.supplierId) params.supplierId = query.supplierId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.qualityInspections.list(params);
    return response as unknown as PaginatedInspections;
  },

  /**
   * Get inspection by ID
   */
  getById: async (id: string): Promise<QualityInspection> => {
    const response = await api.qualityInspections.get(id);
    return response.data as QualityInspection;
  },

  /**
   * Create a new inspection
   */
  create: async (data: CreateInspectionInput): Promise<QualityInspection> => {
    const response = await api.qualityInspections.create(data);
    return response.data as QualityInspection;
  },

  /**
   * Update an inspection
   */
  update: async (id: string, data: Partial<CreateInspectionInput>): Promise<QualityInspection> => {
    const response = await api.qualityInspections.update(id, data);
    return response.data as QualityInspection;
  },

  /**
   * Calculate quality score based on parameters
   */
  calculateScore: (params: {
    moisture: number;
    starchContent: number;
    impurity: number;
    damage: number;
    freshness: number;
  }): { score: number; result: "APPROVED" | "CONDITIONAL" | "REJECTED" } => {
    const { moisture, starchContent, impurity, damage, freshness } = params;

    const score = Math.round(
      starchContent * 0.3 +
        freshness * 0.25 +
        (100 - moisture) * 0.2 +
        (100 - impurity) * 0.15 +
        (100 - damage) * 0.1
    );

    let result: "APPROVED" | "CONDITIONAL" | "REJECTED" = "REJECTED";
    if (score >= 70) result = "APPROVED";
    else if (score >= 50) result = "CONDITIONAL";

    return { score, result };
  },
};
