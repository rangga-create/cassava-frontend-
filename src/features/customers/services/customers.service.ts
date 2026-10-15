import { api } from "@/services/api";
import type { Customer } from "@/types";

export interface CustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedCustomers {
  success: boolean;
  data: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export const customersService = {
  getAll: async (query?: CustomersQuery): Promise<PaginatedCustomers> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.country) params.country = query.country;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.customers.list(params);
    return response as unknown as PaginatedCustomers;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.customers.get(id);
    return response.data as Customer;
  },

  create: async (data: any): Promise<Customer> => {
    const response = await api.customers.create(data);
    return response.data as Customer;
  },

  update: async (id: string, data: any): Promise<Customer> => {
    const response = await api.customers.update(id, data);
    return response.data as Customer;
  },

  delete: async (id: string): Promise<void> => {
    await api.customers.delete(id);
  },
};
