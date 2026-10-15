import { api } from "@/services/api";

// ============================================
// Dashboard Analytics Service
// ============================================

export interface DashboardKPI {
  totalRevenue: number;
  totalProfit: number;
  availableStock: number;
  activeShipments: number;
  receivable: number;
  payable: number;
  businessHealth: number;
  totalProducts: number;
  totalSuppliers: number;
  totalCustomers: number;
}

export interface RecentActivity {
  type: string;
  description: string;
  status: string;
  date: string;
}

export interface DashboardData {
  kpi: DashboardKPI;
  recentActivity: RecentActivity[];
  topProducts: any[];
  revenueByCountry: any[];
}

export const analyticsService = {
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.analytics.dashboard();
    return response.data as DashboardData;
  },

  getRevenueGrowth: async (params?: Record<string, unknown>) => {
    const response = await api.analytics.revenueGrowth(params);
    return response.data;
  },

  getVolumeGrowth: async (params?: Record<string, unknown>) => {
    const response = await api.analytics.volumeGrowth(params);
    return response.data;
  },

  getProfitGrowth: async (params?: Record<string, unknown>) => {
    const response = await api.analytics.profitGrowth(params);
    return response.data;
  },
};
