"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-background text-text-secondary border-border",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    danger: "bg-danger/10 text-danger border-danger/20",
    info: "bg-info/10 text-info border-info/20",
    outline: "bg-transparent text-text-secondary border-border",
  };

  const dotColors = {
    default: "bg-text-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    outline: "bg-text-secondary",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}

// Status Badge for common statuses
export interface StatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_MAP: Record<
  string,
  { variant: BadgeProps["variant"]; label: string }
> = {
  // Common
  ACTIVE: { variant: "success", label: "Active" },
  INACTIVE: { variant: "default", label: "Inactive" },
  PENDING: { variant: "warning", label: "Pending" },
  COMPLETED: { variant: "success", label: "Completed" },
  CANCELLED: { variant: "danger", label: "Cancelled" },

  // Purchase Orders
  DRAFT: { variant: "default", label: "Draft" },
  SUBMITTED: { variant: "info", label: "Submitted" },
  APPROVED: { variant: "success", label: "Approved" },
  SUPPLIER_CONFIRMED: { variant: "info", label: "Confirmed" },
  RECEIVED: { variant: "success", label: "Received" },
  QUALITY_CONTROL: { variant: "warning", label: "QC Pending" },

  // Sales Orders
  CONFIRMED: { variant: "info", label: "Confirmed" },
  PROCESSING: { variant: "warning", label: "Processing" },
  READY: { variant: "success", label: "Ready" },
  SHIPPED: { variant: "info", label: "Shipped" },

  // Quality
  APPROVED_QC: { variant: "success", label: "Approved" },
  CONDITIONAL: { variant: "warning", label: "Conditional" },
  REJECTED: { variant: "danger", label: "Rejected" },

  // Shipments
  PREPARING: { variant: "default", label: "Preparing" },
  LOADED: { variant: "info", label: "Loaded" },
  DEPARTED: { variant: "info", label: "Departed" },
  IN_TRANSIT: { variant: "warning", label: "In Transit" },
  ARRIVED: { variant: "success", label: "Arrived" },
  DELIVERED: { variant: "success", label: "Delivered" },

  // Export
  DOCUMENTATION: { variant: "warning", label: "Documentation" },
  CUSTOMS: { variant: "warning", label: "Customs" },

  // Inventory
  AVAILABLE: { variant: "success", label: "Available" },
  RESERVED: { variant: "info", label: "Reserved" },
  LOW_STOCK: { variant: "warning", label: "Low Stock" },
  DAMAGED: { variant: "danger", label: "Damaged" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || { variant: "default" as const, label: status };

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  );
}
