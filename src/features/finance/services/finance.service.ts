import { api } from "@/services/api";

export interface RevenueData {
  totalRevenue: number;
  transactions: any[];
}

export interface ExpensesData {
  totalExpenses: number;
  transactions: any[];
}

export interface CashFlowData {
  inflow: number;
  outflow: number;
  netCashFlow: number;
  transactions: any[];
}

export interface ProfitabilityData {
  revenue: number;
  expenses: number;
  grossProfit: number;
  grossMargin: number;
}

export const financeService = {
  getRevenue: async (params?: Record<string, unknown>): Promise<RevenueData> => {
    const r = await api.finance.revenue(params);
    return r.data as RevenueData;
  },
  getExpenses: async (params?: Record<string, unknown>): Promise<ExpensesData> => {
    const r = await api.finance.expenses(params);
    return r.data as ExpensesData;
  },
  getCashFlow: async (params?: Record<string, unknown>): Promise<CashFlowData> => {
    const r = await api.finance.cashFlow(params);
    return r.data as CashFlowData;
  },
  getProfitability: async (params?: Record<string, unknown>): Promise<ProfitabilityData> => {
    const r = await api.finance.profitability(params);
    return r.data as ProfitabilityData;
  },
};
