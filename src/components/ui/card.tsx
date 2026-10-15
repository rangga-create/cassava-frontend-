"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  header?: ReactNode;
  footer?: ReactNode;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = "md",
  header,
  footer,
  onClick,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-surface rounded-lg border border-border",
        onClick && "cursor-pointer hover:border-gray-300 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className="px-5 py-3.5 border-b border-border">{header}</div>
      )}
      <div className={paddings[padding]}>{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-border">{footer}</div>
      )}
    </div>
  );
}

// KPI Card Component
export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
}: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn("relative", className)} padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-text-secondary font-medium">{title}</p>
          <p className="mt-1.5 text-xl font-bold text-navy">{value}</p>
          {change !== undefined && (
            <div className="mt-1.5 flex items-center gap-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive && "text-success",
                  isNegative && "text-danger",
                  !isPositive && !isNegative && "text-text-secondary"
                )}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-text-secondary">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-md text-primary">{icon}</div>
        )}
      </div>
    </Card>
  );
}
