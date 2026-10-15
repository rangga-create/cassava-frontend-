import { api } from "@/services/api";
import type { ProductInput } from "@/lib/validations";
import type { Product } from "@/types";

export interface UploadResult {
  url: string;
  publicId: string;
}

// ============================================
// Products Service
// ============================================

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedProducts {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  message: string;
}

export const productsService = {
  /**
   * Get all products with pagination and filters
   */
  getAll: async (query?: ProductsQuery): Promise<PaginatedProducts> => {
    const params: Record<string, unknown> = {};
    if (query?.page) params.page = query.page;
    if (query?.limit) params.limit = query.limit;
    if (query?.search) params.search = query.search;
    if (query?.category) params.category = query.category;
    if (query?.status) params.status = query.status;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (query?.sortOrder) params.sortOrder = query.sortOrder;

    const response = await api.products.list(params);
    return response as unknown as PaginatedProducts;
  },

  /**
   * Get product by ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await api.products.get(id);
    return response.data as Product;
  },

  /**
   * Create a new product
   */
  create: async (data: ProductInput): Promise<Product> => {
    const response = await api.products.create(data);
    return response.data as Product;
  },

  /**
   * Update an existing product
   */
  update: async (id: string, data: Partial<ProductInput>): Promise<Product> => {
    const response = await api.products.update(id, data);
    return response.data as Product;
  },

  /**
   * Delete a product
   */
  delete: async (id: string): Promise<void> => {
    await api.products.delete(id);
  },

  /**
   * Upload image to Cloudinary via backend
   */
  uploadImage: async (file: File, folder?: string): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);
    const response = await api.upload.image(formData);
    return (response as any).data as UploadResult;
  },

  /**
   * Replace image on Cloudinary via backend
   */
  replaceImage: async (file: File, oldPublicId: string, folder?: string): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("oldPublicId", oldPublicId);
    if (folder) formData.append("folder", folder);
    const response = await api.upload.replace(formData);
    return (response as any).data as UploadResult;
  },

  /**
   * Delete image from Cloudinary
   */
  deleteImage: async (publicId: string): Promise<void> => {
    await api.upload.deleteImage(publicId);
  },
};
