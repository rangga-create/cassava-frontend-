"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/features/dashboard";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Package, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const dashboard = useQuery({ queryKey: ["dashboard"], queryFn: analyticsService.getDashboard, staleTime: 60 * 1000 });
  const revenueGrowth = useQuery<{ totalRevenue: number; monthlyRevenue: Record<string, number> }>({ queryKey: ["revenueGrowth"], queryFn: () => analyticsService.getRevenueGrowth() as any, staleTime: 5 * 60 * 1000 });
  const volumeGrowth = useQuery<{ totalVolume: number; monthlyVolume: Record<string, number> }>({ queryKey: ["volumeGrowth"], queryFn: () => analyticsService.getVolumeGrowth() as any, staleTime: 5 * 60 * 1000 });
  const profitGrowth = useQuery<{ revenue: number; expenses: number; profit: number; margin: number }>({ queryKey: ["profitGrowth"], queryFn: () => analyticsService.getProfitGrowth() as any, staleTime: 5 * 60 * 1000 });

  const kpi = dashboard.data?.kpi;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">Analytics</h1>
        <p className="text-sm text-text-secondary">Business intelligence and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md"><BarChart3 className="h-4 w-4 text-primary" /></div>
            <div><p className="text-xs text-text-secondary">Total Revenue</p><p className="text-base font-bold text-navy">{formatCurrency(kpi?.totalRevenue || 0)}</p></div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-md"><TrendingUp className="h-4 w-4 text-success" /></div>
            <div><p className="text-xs text-text-secondary">Total Profit</p><p className="text-base font-bold text-navy">{formatCurrency(kpi?.totalProfit || 0)}</p></div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-md"><Package className="h-4 w-4 text-info" /></div>
            <div><p className="text-xs text-text-secondary">Products</p><p className="text-base font-bold text-navy">{kpi?.totalProducts || 0}</p></div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-md"><Users className="h-4 w-4 text-warning" /></div>
            <div><p className="text-xs text-text-secondary">Customers</p><p className="text-base font-bold text-navy">{kpi?.totalCustomers || 0}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card header={<h2 className="text-sm font-semibold text-navy">Revenue Growth</h2>} padding="md">
          {revenueGrowth.data ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Total Revenue</span>
                <span className="font-bold text-navy text-sm">{formatCurrency(revenueGrowth.data.totalRevenue || 0)}</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(revenueGrowth.data.monthlyRevenue || {}).slice(-6).map(([month, value]) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16">{month}</span>
                    <div className="flex-1 bg-border rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${Math.min(((value as number) / (revenueGrowth.data.totalRevenue || 1)) * 100 * 3, 100)}%` }} /></div>
                    <span className="text-xs font-medium w-20 text-right">{formatCurrency(value as number)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-text-secondary text-sm">Loading...</p>}
        </Card>

        <Card header={<h2 className="text-sm font-semibold text-navy">Volume Growth</h2>} padding="md">
          {volumeGrowth.data ? (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-secondary">Total Volume</span>
                <span className="font-bold text-navy text-sm">{(volumeGrowth.data.totalVolume || 0).toLocaleString()} MT</span>
              </div>
              <div className="space-y-1.5">
                {Object.entries(volumeGrowth.data.monthlyVolume || {}).slice(-6).map(([month, value]) => (
                  <div key={month} className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary w-16">{month}</span>
                    <div className="flex-1 bg-border rounded-full h-1.5"><div className="bg-info h-1.5 rounded-full" style={{ width: `${Math.min(((value as number) / (volumeGrowth.data.totalVolume || 1)) * 100 * 3, 100)}%` }} /></div>
                    <span className="text-xs font-medium w-20 text-right">{(value as number).toLocaleString()} MT</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-text-secondary text-sm">Loading...</p>}
        </Card>
      </div>

      <Card header={<h2 className="text-sm font-semibold text-navy">Profitability</h2>} padding="md">
        {profitGrowth.data ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-success/5 rounded-md">
              <p className="text-xs text-text-secondary">Revenue</p>
              <p className="text-lg font-bold text-success">{formatCurrency(profitGrowth.data.revenue || 0)}</p>
            </div>
            <div className="text-center p-3 bg-danger/5 rounded-md">
              <p className="text-xs text-text-secondary">Expenses</p>
              <p className="text-lg font-bold text-danger">{formatCurrency(profitGrowth.data.expenses || 0)}</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-md">
              <p className="text-xs text-text-secondary">Profit</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(profitGrowth.data.profit || 0)}</p>
            </div>
            <div className="text-center p-3 bg-info/5 rounded-md">
              <p className="text-xs text-text-secondary">Margin</p>
              <p className="text-lg font-bold text-info">{profitGrowth.data.margin || 0}%</p>
            </div>
          </div>
        ) : <p className="text-text-secondary text-sm">Loading...</p>}
      </Card>
    </div>
  );
}
