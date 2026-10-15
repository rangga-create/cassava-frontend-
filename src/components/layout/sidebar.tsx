"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Warehouse,
  ClipboardCheck,
  Factory,
  TrendingUp,
  Globe,
  Truck,
  FileText,
  BarChart3,
  Bell,
  Phone,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { label: "Products", href: "/products", icon: <Package className="h-[18px] w-[18px]" /> },
  { label: "Suppliers", href: "/suppliers", icon: <Users className="h-[18px] w-[18px]" /> },
  { label: "Customers", href: "/customers", icon: <Users className="h-[18px] w-[18px]" /> },
  { label: "Procurement", href: "/procurement", icon: <ShoppingCart className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "PROCUREMENT"] },
  { label: "Inventory", href: "/inventory", icon: <Warehouse className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "WAREHOUSE"] },
  { label: "Quality Control", href: "/quality-control", icon: <ClipboardCheck className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "QUALITY_CONTROL"] },
  { label: "Processing", href: "/processing", icon: <Factory className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { label: "Sales", href: "/sales", icon: <TrendingUp className="h-[18px] w-[18px]" /> },
  { label: "Export", href: "/export", icon: <Globe className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "LOGISTICS"] },
  { label: "Import", href: "/import", icon: <Globe className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "LOGISTICS"] },
  { label: "Shipments", href: "/shipments", icon: <Truck className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER", "LOGISTICS"] },
  { label: "Finance", href: "/finance", icon: <FileText className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "FINANCE"] },
  { label: "Analytics", href: "/analytics", icon: <BarChart3 className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN", "MANAGER"] },
  { label: "Export Contacts", href: "/export-contacts", icon: <Phone className="h-[18px] w-[18px]" />, roles: ["OWNER", "ADMIN"] },
  { label: "AI Assistant", href: "/ai", icon: <Bot className="h-[18px] w-[18px]" /> },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Notifications", href: "/notifications", icon: <Bell className="h-[18px] w-[18px]" />, badge: 3 },
  { label: "Settings", href: "/settings", icon: <Settings className="h-[18px] w-[18px]" /> },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-surface border-r border-border z-40 transition-all duration-200",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img src="/logo-indocassava.jpeg" alt="INDOCASSAVA" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-navy leading-tight">INDOCASSAVA</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-wider">Export</span>
            </div>
          </Link>
        )}
        {collapsed && (
          <img src="/logo-indocassava.jpeg" alt="ICE" className="w-8 h-8 rounded-full object-cover mx-auto" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1 rounded text-text-secondary hover:text-text hover:bg-background transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="space-y-0.5 px-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-text-secondary hover:text-text hover:bg-background",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto px-1.5 py-0.5 text-[11px] font-medium bg-danger text-white rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border py-3 px-2 space-y-0.5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-text-secondary hover:text-text hover:bg-background",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto px-1.5 py-0.5 text-[11px] font-medium bg-danger text-white rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text hover:bg-background transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
