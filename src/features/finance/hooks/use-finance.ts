"use client";
import { useQuery } from "@tanstack/react-query";
import { financeService, RevenueData, ExpensesData, CashFlowData, ProfitabilityData } from "../services/finance.service";

export function useFinance() {
  const revenue = useQuery<RevenueData>({ queryKey: ["finance", "revenue"], queryFn: financeService.getRevenue, staleTime: 5 * 60 * 1000 });
  const expenses = useQuery<ExpensesData>({ queryKey: ["finance", "expenses"], queryFn: financeService.getExpenses, staleTime: 5 * 60 * 1000 });
  const cashFlow = useQuery<CashFlowData>({ queryKey: ["finance", "cashFlow"], queryFn: financeService.getCashFlow, staleTime: 5 * 60 * 1000 });
  const profitability = useQuery<ProfitabilityData>({ queryKey: ["finance", "profitability"], queryFn: financeService.getProfitability, staleTime: 5 * 60 * 1000 });

  return {
    revenue: revenue.data, expenses: expenses.data, cashFlow: cashFlow.data, profitability: profitability.data,
    loading: revenue.isLoading || expenses.isLoading || cashFlow.isLoading || profitability.isLoading,
  };
}
