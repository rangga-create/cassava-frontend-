import axios, { AxiosInstance, AxiosError } from "axios";
import type { ApiResponse, ApiError } from "@/types";

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

// ============================================
// Axios Instance
// ============================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// API Methods
// ============================================

export const api = {
  // Generic methods
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  },

  post: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  put: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  patch: async <T>(url: string, data?: unknown): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data);
    return response.data;
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  },

  // Auth
  auth: {
    login: (data: { email: string; password: string }) =>
      api.post<{ token: string; user: unknown }>("/auth/login", data),
    register: (data: { email: string; password: string; name: string }) =>
      api.post<{ token: string; user: unknown }>("/auth/register", data),
    logout: () => api.post("/auth/logout"),
    refreshToken: () => api.post<{ token: string }>("/auth/refresh-token"),
  },

  // Users
  users: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/users", params),
    get: (id: string) => api.get<unknown>(`/users/${id}`),
    create: (data: unknown) => api.post<unknown>("/users", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
  },

  // Companies
  companies: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/companies", params),
    get: (id: string) => api.get<unknown>(`/companies/${id}`),
    create: (data: unknown) => api.post<unknown>("/companies", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/companies/${id}`, data),
    delete: (id: string) => api.delete(`/companies/${id}`),
  },

  // Products
  products: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/products", params),
    get: (id: string) => api.get<unknown>(`/products/${id}`),
    create: (data: unknown) => api.post<unknown>("/products", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
  },

  // Suppliers
  suppliers: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/suppliers", params),
    get: (id: string) => api.get<unknown>(`/suppliers/${id}`),
    create: (data: unknown) => api.post<unknown>("/suppliers", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/suppliers/${id}`, data),
    delete: (id: string) => api.delete(`/suppliers/${id}`),
    performance: (id: string) => api.get<unknown>(`/suppliers/${id}/performance`),
  },

  // Customers
  customers: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/customers", params),
    get: (id: string) => api.get<unknown>(`/customers/${id}`),
    create: (data: unknown) => api.post<unknown>("/customers", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
  },

  // Purchase Orders
  purchaseOrders: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/purchase-orders", params),
    get: (id: string) => api.get<unknown>(`/purchase-orders/${id}`),
    create: (data: unknown) => api.post<unknown>("/purchase-orders", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/purchase-orders/${id}`, data),
    updateStatus: (id: string, status: string) =>
      api.patch(`/purchase-orders/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/purchase-orders/${id}`),
  },

  // Sales Orders
  salesOrders: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/sales-orders", params),
    get: (id: string) => api.get<unknown>(`/sales-orders/${id}`),
    create: (data: unknown) => api.post<unknown>("/sales-orders", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/sales-orders/${id}`, data),
    updateStatus: (id: string, status: string) =>
      api.patch(`/sales-orders/${id}/status`, { status }),
    delete: (id: string) => api.delete(`/sales-orders/${id}`),
  },

  // Batches
  batches: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/batches", params),
    get: (id: string) => api.get<unknown>(`/batches/${id}`),
    create: (data: unknown) => api.post<unknown>("/batches", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/batches/${id}`, data),
    traceability: (id: string) => api.get<unknown>(`/batches/${id}/traceability`),
  },

  // Quality Inspections
  qualityInspections: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/quality-inspections", params),
    get: (id: string) => api.get<unknown>(`/quality-inspections/${id}`),
    create: (data: unknown) => api.post<unknown>("/quality-inspections", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/quality-inspections/${id}`, data),
  },

  // Inventory
  inventory: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/inventory", params),
    get: (id: string) => api.get<unknown>(`/inventory/${id}`),
    create: (data: unknown) => api.post<unknown>("/inventory", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/inventory/${id}`, data),
  },

  // Warehouses
  warehouses: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/warehouses", params),
    get: (id: string) => api.get<unknown>(`/warehouses/${id}`),
    create: (data: unknown) => api.post<unknown>("/warehouses", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/warehouses/${id}`, data),
    metrics: (id: string) => api.get<unknown>(`/warehouses/${id}/metrics`),
  },

  // Processing Orders
  processingOrders: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/processing-orders", params),
    get: (id: string) => api.get<unknown>(`/processing-orders/${id}`),
    create: (data: unknown) => api.post<unknown>("/processing-orders", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/processing-orders/${id}`, data),
  },

  // Export Orders
  exportOrders: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/export-orders", params),
    get: (id: string) => api.get<unknown>(`/export-orders/${id}`),
    create: (data: unknown) => api.post<unknown>("/export-orders", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/export-orders/${id}`, data),
    updateStatus: (id: string, status: string) =>
      api.patch(`/export-orders/${id}/status`, { status }),
  },

  // Import Orders
  importOrders: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/import-orders", params),
    get: (id: string) => api.get<unknown>(`/import-orders/${id}`),
    create: (data: unknown) => api.post<unknown>("/import-orders", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/import-orders/${id}`, data),
    updateStatus: (id: string, status: string) =>
      api.patch(`/import-orders/${id}/status`, { status }),
  },

  // Shipments
  shipments: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/shipments", params),
    get: (id: string) => api.get<unknown>(`/shipments/${id}`),
    create: (data: unknown) => api.post<unknown>("/shipments", data),
    update: (id: string, data: unknown) => api.patch<unknown>(`/shipments/${id}`, data),
    updateStatus: (id: string, status: string) =>
      api.patch(`/shipments/${id}/status`, { status }),
  },

  // Upload
  upload: {
    image: (data: FormData) =>
      apiClient.post<ApiResponse<{ url: string; publicId: string }>>("/upload/image", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    replace: (data: FormData) =>
      apiClient.post<ApiResponse<{ url: string; publicId: string }>>("/upload/replace", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    deleteImage: (publicId: string) =>
      apiClient.delete<ApiResponse<null>>(`/upload/image`, { data: { publicId } }),
  },

  // Documents
  documents: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/documents", params),
    upload: (data: FormData) =>
      apiClient.post<ApiResponse<unknown>>("/documents", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    delete: (id: string) => api.delete(`/documents/${id}`),
  },

  // Finance
  finance: {
    revenue: (params?: Record<string, unknown>) => api.get<unknown>("/finance/revenue", params),
    expenses: (params?: Record<string, unknown>) => api.get<unknown>("/finance/expenses", params),
    cashFlow: (params?: Record<string, unknown>) => api.get<unknown>("/finance/cash-flow", params),
    profitability: (params?: Record<string, unknown>) =>
      api.get<unknown>("/finance/profitability", params),
  },

  // Analytics
  analytics: {
    dashboard: () => api.get<unknown>("/analytics/dashboard"),
    revenueGrowth: (params?: Record<string, unknown>) =>
      api.get<unknown>("/analytics/revenue-growth", params),
    volumeGrowth: (params?: Record<string, unknown>) =>
      api.get<unknown>("/analytics/volume-growth", params),
    profitGrowth: (params?: Record<string, unknown>) =>
      api.get<unknown>("/analytics/profit-growth", params),
  },

  // Reports
  reports: {
    procurement: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/procurement", params),
    inventory: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/inventory", params),
    quality: (params?: Record<string, unknown>) => api.get<unknown>("/reports/quality", params),
    sales: (params?: Record<string, unknown>) => api.get<unknown>("/reports/sales", params),
    export: (params?: Record<string, unknown>) => api.get<unknown>("/reports/export", params),
    import: (params?: Record<string, unknown>) => api.get<unknown>("/reports/import", params),
    shipment: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/shipment", params),
    financial: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/financial", params),
    profitability: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/profitability", params),
    supplier: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/supplier", params),
    customer: (params?: Record<string, unknown>) =>
      api.get<unknown>("/reports/customer", params),
  },

  // Payments
  payments: {
    create: (data: unknown) => api.post<unknown>("/payments/create", data),
    webhook: (data: unknown) => api.post<unknown>("/payments/webhook/midtrans", data),
    status: (salesOrderId: string) => api.get<unknown>(`/payments/status/${salesOrderId}`),
  },

  // Contact
  contact: {
    submit: (data: {
      name: string;
      email: string;
      company?: string;
      phone?: string;
      subject: string;
      message: string;
    }) => api.post<{ id: string }>("/contact", data),
  },

  // Notifications
  notifications: {
    list: (params?: Record<string, unknown>) => api.get<unknown[]>("/notifications", params),
    markRead: (id: string) => api.patch(`/notifications/${id}/read`),
    markAllRead: () => api.patch("/notifications/read-all"),
  },

  // AI Assistant
  ai: {
    chat: (data: {
      messages: { role: "user" | "assistant" | "system"; content: string }[];
      analysisType?: string;
      companyId?: string;
      contextId?: string;
    }) => api.post<{ response: string; data?: Record<string, any>; suggestions?: string[] }>("/ai/chat", data),
    analyze: (data: {
      type: string;
      companyId?: string;
      entityId?: string;
      relatedEntityId?: string;
      question?: string;
    }) => api.post<{
      type: string;
      summary: string;
      details: Record<string, any>;
      recommendations: string[];
      metrics?: Record<string, number>;
    }>("/ai/analyze", data),
    priceNegotiation: (data: { productId: string; customerId?: string; companyId?: string; question?: string }) =>
      api.post("/ai/price-negotiation", data),
    inventoryOptimization: (data: { productId?: string; companyId?: string; question?: string }) =>
      api.post("/ai/inventory-optimization", data),
    supplierPerformance: (data: { supplierId: string; companyId?: string; question?: string }) =>
      api.post("/ai/supplier-performance", data),
    salesForecasting: (data: { customerId?: string; companyId?: string; question?: string }) =>
      api.post("/ai/sales-forecasting", data),
    profitability: (data: { productId?: string; customerId?: string; companyId?: string; question?: string }) =>
      api.post("/ai/profitability", data),
    riskAlerts: (data: { companyId?: string; question?: string }) =>
      api.post("/ai/risk-alerts", data),
    analysisTypes: () => api.get<string[]>("/ai/analysis-types"),
  },

  // Community
  community: {
    invitations: {
      create: <T,>(groupId: string) => api.post<T>(`/community/groups/${groupId}/invitations`),
      get: <T,>(token: string) => api.get<T>(`/community/invitations/${token}`),
      join: <T,>(token: string) => api.post<T>(`/community/invitations/${token}/join`),
    },
    groups: {
      list: <T,>(params?: Record<string, unknown>) => api.get<T[]>("/community/groups", params),
      get: <T,>(id: string) => api.get<T>(`/community/groups/${id}`),
      create: <T,>(data: unknown) => api.post<T>("/community/groups", data),
      update: <T,>(id: string, data: unknown) => api.put<T>(`/community/groups/${id}`, data),
      delete: (id: string) => api.delete(`/community/groups/${id}`),
      join: (id: string) => api.post<unknown>(`/community/groups/${id}/join`),
      leave: (id: string) => api.post<unknown>(`/community/groups/${id}/leave`),
      members: <T,>(id: string, params?: Record<string, unknown>) =>
        api.get<T[]>(`/community/groups/${id}/members`, params),
      updateMemberRole: <T,>(groupId: string, userId: string, data: unknown) =>
        api.put<T>(`/community/groups/${groupId}/members/${userId}/role`, data),
      removeMember: (groupId: string, userId: string) =>
        api.delete<unknown>(`/community/groups/${groupId}/members/${userId}`),
      invite: <T,>(groupId: string, data: unknown) => api.post<T>(`/community/groups/${groupId}/invite`, data),
      messages: <T,>(id: string, params?: Record<string, unknown>) =>
        api.get<T[]>(`/community/groups/${id}/messages`, params),
    },
    messages: {
      send: <T,>(groupId: string, data: { text: string }) =>
        api.post<T>(`/community/groups/${groupId}/messages`, data),
      delete: (messageId: string) => api.delete<unknown>(`/community/messages/${messageId}`),
    },
    reports: {
      create: <T,>(data: unknown) => api.post<T>("/community/reports", data),
      list: <T,>(groupId: string, params?: Record<string, unknown>) =>
        api.get<T[]>(`/community/groups/${groupId}/reports`, params),
      review: <T,>(reportId: string, data: unknown) =>
        api.put<T>(`/community/reports/${reportId}/review`, data),
    },
    moderation: {
      history: <T,>(groupId: string) => api.get<T[]>(`/community/groups/${groupId}/moderation-history`),
    },
  },
};

export default api;
