import { api } from "@/services/api";
import type { Company } from "@/types";

// ============================================
// Companies Service
// ============================================

export interface CompaniesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedCompanies {
  success: boolean;
  data: Company[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export interface CreateCompanyInput {
  name: string;
  description?: string;
  industry?: string;
  country?: string;
  province?: string;
  city?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
  registrationNumber?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export const companiesService = {
  getAll: async (query?: CompaniesQuery): Promise<PaginatedCompanies> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.companies.list(params);
    return response as unknown as PaginatedCompanies;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await api.companies.get(id);
    return response.data as Company;
  },

  create: async (data: CreateCompanyInput): Promise<Company> => {
    const response = await api.companies.create(data);
    return response.data as Company;
  },

  update: async (id: string, data: UpdateCompanyInput): Promise<Company> => {
    const response = await api.companies.update(id, data);
    return response.data as Company;
  },

  delete: async (id: string): Promise<void> => {
    await api.companies.delete(id);
  },
};
