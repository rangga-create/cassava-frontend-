"use client";
import { useFinance } from "@/features/finance";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function FinancePage() {
  const { revenue, expenses, cashFlow, profitability, loading } = useFinance();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">Finance</h1>
        <p className="text-text-secondary">Financial overview and cash flow management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={loading ? "..." : formatCurrency(revenue?.totalRevenue || 0)} icon={<DollarSign className="h-5 w-5" />} />
        <KPICard title="Total Expenses" value={loading ? "..." : formatCurrency(expenses?.totalExpenses || 0)} icon={<TrendingDown className="h-5 w-5" />} />
        <KPICard title="Net Cash Flow" value={loading ? "..." : formatCurrency(cashFlow?.netCashFlow || 0)} icon={<ArrowLeftRight className="h-5 w-5" />} />
        <KPICard title="Gross Margin" value={loading ? "..." : `${profitability?.grossMargin || 0}%`} icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h2 className="text-sm font-semibold text-navy">Revenue vs Expenses</h2>} padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Revenue</span>
              <span className="text-sm font-bold text-success">{formatCurrency(profitability?.revenue || 0)}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-success h-2 rounded-full" style={{ width: "100%" }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Expenses</span>
              <span className="text-sm font-bold text-danger">{formatCurrency(profitability?.expenses || 0)}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
              <div className="bg-danger h-2 rounded-full" style={{ width: `${profitability?.revenue ? (profitability.expenses / profitability.revenue * 100) : 0}%` }} />
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-medium">Gross Profit</span>
              <span className="text-lg font-bold text-navy">{formatCurrency(profitability?.grossProfit || 0)}</span>
            </div>
          </div>
        </Card>

        <Card header={<h2 className="text-sm font-semibold text-navy">Cash Flow Summary</h2>} padding="md">
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-success/5 rounded-md border border-success/20">
              <div className="p-1.5 bg-success/10 rounded-md"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div className="flex-1"><p className="text-sm text-text-secondary">Cash Inflow</p><p className="text-lg font-bold text-success">{formatCurrency(cashFlow?.inflow || 0)}</p></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-danger/5 rounded-md border border-danger/20">
              <div className="p-1.5 bg-danger/10 rounded-md"><TrendingDown className="h-5 w-5 text-danger" /></div>
              <div className="flex-1"><p className="text-sm text-text-secondary">Cash Outflow</p><p className="text-lg font-bold text-danger">{formatCurrency(cashFlow?.outflow || 0)}</p></div>
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm font-medium">Net Cash Flow</span>
              <span className={`text-lg font-bold ${(cashFlow?.netCashFlow || 0) >= 0 ? "text-success" : "text-danger"}`}>
                {formatCurrency(cashFlow?.netCashFlow || 0)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card header={<h2 className="text-sm font-semibold text-navy">Recent Transactions</h2>} padding="none">
        <div className="p-6 text-center text-text-secondary text-sm">
          Transaction history will appear here
        </div>
      </Card>
    </div>
  );
}
