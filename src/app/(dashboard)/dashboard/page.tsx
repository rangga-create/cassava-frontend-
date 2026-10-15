"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/features/dashboard";
import { useAuth } from "@/hooks/use-auth";
import { KPICard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#1a7a3a", "#2563EB", "#d97706", "#dc2626", "#6b7280"];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  SALES_ORDER: <CheckCircle className="h-4 w-4 text-success" />,
  PURCHASE_ORDER: <Package className="h-4 w-4 text-info" />,
  SHIPMENT: <Truck className="h-4 w-4 text-primary" />,
  QUALITY_CONTROL: <AlertTriangle className="h-4 w-4 text-warning" />,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ============================================
// Admin Dashboard - Full view
// ============================================
function AdminDashboard({ kpi, activity, revenueByCountry, isLoading }: any) {
  const revenueChartData = [
    { month: "Jan", revenue: 0, profit: 0 },
    { month: "Feb", revenue: 0, profit: 0 },
    { month: "Mar", revenue: 0, profit: 0 },
    { month: "Apr", revenue: 0, profit: 0 },
    { month: "May", revenue: 0, profit: 0 },
    { month: "Jun", revenue: 0, profit: 0 },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={isLoading ? "..." : formatCurrency(kpi?.totalRevenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="Total Profit"
          value={isLoading ? "..." : formatCurrency(kpi?.totalProfit || 0)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="Available Stock"
          value={isLoading ? "..." : `${(kpi?.availableStock || 0).toLocaleString()} MT`}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Active Shipments"
          value={isLoading ? "..." : String(kpi?.activeShipments || 0)}
          icon={<Truck className="h-5 w-5" />}
        />
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-xs text-text-secondary font-medium">Receivable</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {isLoading ? "..." : formatCurrency(kpi?.receivable || 181000)}
          </p>
          <p className="mt-1 text-xs text-warning">12 invoices pending</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-text-secondary font-medium">Payable</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {isLoading ? "..." : formatCurrency(kpi?.payable || 75000)}
          </p>
          <p className="mt-1 text-xs text-danger">3 overdue</p>
        </Card>
        <Card padding="md">
          <p className="text-xs text-text-secondary font-medium">Business Health</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {isLoading ? "..." : `${kpi?.businessHealth || 0} / 100`}
          </p>
          <div className="w-full bg-border rounded-full h-1.5 mt-2">
            <div
              className="bg-success h-1.5 rounded-full transition-all"
              style={{ width: `${kpi?.businessHealth || 0}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          header={<h2 className="text-sm font-semibold text-navy">Revenue Overview</h2>}
          padding="md"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: "6px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="revenue" fill="#1a7a3a" radius={[3, 3, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#2563EB" radius={[3, 3, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          header={<h2 className="text-sm font-semibold text-navy">Revenue by Country</h2>}
          padding="md"
        >
          {revenueByCountry.length > 0 ? (
            <div className="h-56 flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCountry}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="revenue"
                  >
                    {revenueByCountry.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-1/2 space-y-1.5">
                {revenueByCountry.map((item: any, index: number) => (
                  <div key={item.country} className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-text">{item.country}</span>
                    <span className="text-xs font-medium text-text-secondary ml-auto">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-text-secondary text-sm">
              No revenue data available yet
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          header={<h2 className="text-sm font-semibold text-navy">Quick Stats</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            {[
              { label: "Total Products", value: kpi?.totalProducts || 0, icon: <Package className="h-4 w-4 text-primary" />, bg: "bg-primary/10" },
              { label: "Total Suppliers", value: kpi?.totalSuppliers || 0, icon: <Users className="h-4 w-4 text-success" />, bg: "bg-success/10" },
              { label: "Total Customers", value: kpi?.totalCustomers || 0, icon: <Users className="h-4 w-4 text-info" />, bg: "bg-info/10" },
              { label: "Active Shipments", value: kpi?.activeShipments || 0, icon: <Clock className="h-4 w-4 text-warning" />, bg: "bg-warning/10" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 ${stat.bg} rounded-md`}>{stat.icon}</div>
                  <span className="text-sm text-text">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-navy">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card
          header={<h2 className="text-sm font-semibold text-navy">Recent Activity</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            {activity.length > 0 ? (
              activity.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 px-5 py-3 hover:bg-background">
                  {ACTIVITY_ICONS[item.type] || <CheckCircle className="h-4 w-4 text-text-secondary" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{item.description}</p>
                    <p className="text-xs text-text-secondary">{formatDate(item.date)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-text-secondary text-sm">No recent activity</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

// ============================================
// Manager Dashboard - Operations focused
// ============================================
function ManagerDashboard({ kpi, activity, isLoading }: any) {
  return (
    <>
      {/* Operations KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Available Stock"
          value={isLoading ? "..." : `${(kpi?.availableStock || 0).toLocaleString()} MT`}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Active Shipments"
          value={isLoading ? "..." : String(kpi?.activeShipments || 0)}
          icon={<Truck className="h-5 w-5" />}
        />
        <KPICard
          title="Total Products"
          value={isLoading ? "..." : String(kpi?.totalProducts || 0)}
          icon={<Package className="h-5 w-5" />}
        />
        <KPICard
          title="Total Suppliers"
          value={isLoading ? "..." : String(kpi?.totalSuppliers || 0)}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Business Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card padding="md">
          <p className="text-xs text-text-secondary font-medium">Business Health</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {isLoading ? "..." : `${kpi?.businessHealth || 0} / 100`}
          </p>
          <div className="w-full bg-border rounded-full h-1.5 mt-2">
            <div
              className="bg-success h-1.5 rounded-full transition-all"
              style={{ width: `${kpi?.businessHealth || 0}%` }}
            />
          </div>
        </Card>
        <Card padding="md">
          <p className="text-xs text-text-secondary font-medium">Total Customers</p>
          <p className="mt-1 text-lg font-bold text-navy">
            {isLoading ? "..." : String(kpi?.totalCustomers || 0)}
          </p>
          <p className="mt-1 text-xs text-success">All accounts active</p>
        </Card>
      </div>

      {/* Quick Stats & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          header={<h2 className="text-sm font-semibold text-navy">Operations Overview</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            {[
              { label: "Products in Catalog", value: kpi?.totalProducts || 0, icon: <Package className="h-4 w-4 text-primary" />, bg: "bg-primary/10" },
              { label: "Active Suppliers", value: kpi?.totalSuppliers || 0, icon: <Users className="h-4 w-4 text-success" />, bg: "bg-success/10" },
              { label: "Active Customers", value: kpi?.totalCustomers || 0, icon: <Globe className="h-4 w-4 text-info" />, bg: "bg-info/10" },
              { label: "Shipments in Transit", value: kpi?.activeShipments || 0, icon: <Truck className="h-4 w-4 text-warning" />, bg: "bg-warning/10" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 ${stat.bg} rounded-md`}>{stat.icon}</div>
                  <span className="text-sm text-text">{stat.label}</span>
                </div>
                <span className="text-sm font-semibold text-navy">{stat.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          header={<h2 className="text-sm font-semibold text-navy">Recent Activity</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            {activity.length > 0 ? (
              activity.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-3 px-5 py-3 hover:bg-background">
                  {ACTIVITY_ICONS[item.type] || <CheckCircle className="h-4 w-4 text-text-secondary" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{item.description}</p>
                    <p className="text-xs text-text-secondary">{formatDate(item.date)}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-text-secondary text-sm">No recent activity</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

// ============================================
// Sales Dashboard - Sales focused
// ============================================
function SalesDashboard({ kpi, activity, revenueByCountry, isLoading }: any) {
  return (
    <>
      {/* Sales KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={isLoading ? "..." : formatCurrency(kpi?.totalRevenue || 0)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KPICard
          title="Total Profit"
          value={isLoading ? "..." : formatCurrency(kpi?.totalProfit || 0)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KPICard
          title="Active Shipments"
          value={isLoading ? "..." : String(kpi?.activeShipments || 0)}
          icon={<Truck className="h-5 w-5" />}
        />
        <KPICard
          title="Total Customers"
          value={isLoading ? "..." : String(kpi?.totalCustomers || 0)}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Revenue by Country */}
      <Card
        header={<h2 className="text-sm font-semibold text-navy">Revenue by Country</h2>}
        padding="md"
      >
        {revenueByCountry.length > 0 ? (
          <div className="h-56 flex items-center">
            <ResponsiveContainer width="50%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByCountry}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="revenue"
                >
                  {revenueByCountry.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/2 space-y-1.5">
              {revenueByCountry.map((item: any, index: number) => (
                <div key={item.country} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-text">{item.country}</span>
                  <span className="text-xs font-medium text-text-secondary ml-auto">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-56 flex items-center justify-center text-text-secondary text-sm">
            No revenue data available yet
          </div>
        )}
      </Card>

      {/* Sales Activity & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          header={<h2 className="text-sm font-semibold text-navy">Recent Sales Activity</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            {activity.length > 0 ? (
              activity
                .filter((item: any) => item.type === "SALES_ORDER")
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-3 hover:bg-background">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{item.description}</p>
                      <p className="text-xs text-text-secondary">{formatDate(item.date)}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))
            ) : (
              <div className="px-5 py-8 text-center text-text-secondary text-sm">No recent sales activity</div>
            )}
          </div>
        </Card>

        <Card
          header={<h2 className="text-sm font-semibold text-navy">Sales Summary</h2>}
          padding="none"
        >
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-md">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-text">Total Revenue</span>
              </div>
              <span className="text-sm font-semibold text-navy">{formatCurrency(kpi?.totalRevenue || 0)}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-success/10 rounded-md">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-text">Total Profit</span>
              </div>
              <span className="text-sm font-semibold text-navy">{formatCurrency(kpi?.totalProfit || 0)}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-info/10 rounded-md">
                  <Users className="h-4 w-4 text-info" />
                </div>
                <span className="text-sm text-text">Customers Served</span>
              </div>
              <span className="text-sm font-semibold text-navy">{kpi?.totalCustomers || 0}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-warning/10 rounded-md">
                  <Truck className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm text-text">Shipments Sent</span>
              </div>
              <span className="text-sm font-semibold text-navy">{kpi?.activeShipments || 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

// ============================================
// Main Dashboard Page
// ============================================
export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role;

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: analyticsService.getDashboard,
    staleTime: 60 * 1000,
  });

  const kpi = dashboard?.kpi;
  const activity = dashboard?.recentActivity || [];
  const revenueByCountry = dashboard?.revenueByCountry || [];

  const getRoleLabel = () => {
    if (role === "OWNER" || role === "ADMIN") return "Admin";
    if (role === "MANAGER") return "Manager";
    if (role === "SALES") return "Sales";
    return "User";
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-navy">
          {getRoleLabel()} Dashboard
        </h1>
        <p className="text-sm text-text-secondary">
          Welcome back, {user?.name || "User"}! Here&apos;s what&apos;s happening with your{" "}
          {role === "SALES" ? "sales" : "business"}.
        </p>
      </div>

      {/* Role-based Content */}
      {role === "OWNER" || role === "ADMIN" ? (
        <AdminDashboard kpi={kpi} activity={activity} revenueByCountry={revenueByCountry} isLoading={isLoading} />
      ) : role === "MANAGER" ? (
        <ManagerDashboard kpi={kpi} activity={activity} isLoading={isLoading} />
      ) : role === "SALES" ? (
        <SalesDashboard kpi={kpi} activity={activity} revenueByCountry={revenueByCountry} isLoading={isLoading} />
      ) : (
        <AdminDashboard kpi={kpi} activity={activity} revenueByCountry={revenueByCountry} isLoading={isLoading} />
      )}
    </div>
  );
}
