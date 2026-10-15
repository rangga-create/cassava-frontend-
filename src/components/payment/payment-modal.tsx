"use client";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { usePayment } from "@/features/payments";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import type { SalesOrder } from "@/types";

declare global {
  interface Window {
    snap: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrder;
}

export function PaymentModal({ isOpen, onClose, order }: PaymentModalProps) {
  const { user } = useAuth();
  const { createPayment, isCreating } = usePayment(order.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Midtrans Snap script
    if (!document.getElementById("midtrans-snap-script")) {
      const script = document.createElement("script");
      script.id = "midtrans-snap-script";
      script.src =
        process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute(
        "data-client-key",
        process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
      );
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Create payment on backend
      const firstName = order.customerName?.split(" ")[0] || "Customer";
      const lastName = order.customerName?.split(" ").slice(1).join(" ") || "";
      const customerEmail = user?.email || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`;
      
      const result = await createPayment({
        salesOrderId: order.id,
        amount: order.total,
        currency: order.currency,
        customerDetails: {
          firstName,
          lastName,
          email: customerEmail,
          phone: user?.phone || "+628123456789",
        },
      });

      // 2. Display Midtrans Snap popup
      const snapResult = result as { token: string };
      window.snap.pay(snapResult.token, {
        onSuccess: () => {
          // ✅ Only close modal and refresh data
          // ❌ Do NOT update order status here
          onClose();
          // React Query will auto-refresh due to invalidation in usePayment
        },
        onPending: () => {
          onClose();
        },
        onError: () => {
          setError("Payment failed. Please try again.");
        },
        onClose: () => {
          // Customer closed without completing
        },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create payment",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment">
      <div className="space-y-4">
        <div className="bg-background rounded-lg p-4">
          <p className="text-sm text-text-secondary">Order Number</p>
          <p className="font-medium">{order.soNumber}</p>
        </div>

        <div className="bg-background rounded-lg p-4">
          <p className="text-sm text-text-secondary">Amount</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(order.total, order.currency)}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-md p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePayment} loading={loading || isCreating}>
            Pay Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
