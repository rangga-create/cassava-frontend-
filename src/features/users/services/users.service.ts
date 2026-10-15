import { api } from "@/services/api";
import type { User } from "@/types";

// ============================================
// Users Service
// ============================================

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  companyId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedUsers {
  success: boolean;
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: string;
  phone?: string;
  companyId?: string;
  status?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

export const usersService = {
  getAll: async (query?: UsersQuery): Promise<PaginatedUsers> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.role) params.role = query.role;
    if (query?.status) params.status = query.status;
    if (query?.companyId) params.companyId = query.companyId;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.users.list(params);
    return response as unknown as PaginatedUsers;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.users.get(id);
    return response.data as User;
  },

  create: async (data: CreateUserInput): Promise<User> => {
    const response = await api.users.create(data);
    return response.data as User;
  },

  update: async (id: string, data: UpdateUserInput): Promise<User> => {
    const response = await api.users.update(id, data);
    return response.data as User;
  },

  delete: async (id: string): Promise<void> => {
    await api.users.delete(id);
  },
};
