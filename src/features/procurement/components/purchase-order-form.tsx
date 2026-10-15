"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PurchaseOrder } from "@/types";

const UNIT_OPTIONS = [
  { value: "MT", label: "Metric Ton (MT)" },
  { value: "KG", label: "Kilogram (KG)" },
  { value: "TON", label: "Ton" },
  { value: "BAG", label: "Bag" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "Net 90", label: "Net 90" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "LC", label: "Letter of Credit" },
  { value: "T/T", label: "Telegraphic Transfer" },
];

interface PurchaseOrderFormProps {
  order?: PurchaseOrder;
  onSubmit: (data: PurchaseOrderInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function PurchaseOrderForm({
  order,
  onSubmit,
  onCancel,
  loading = false,
}: PurchaseOrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: order
      ? {
          supplierId: order.supplierId,
          productId: order.productId,
          quantity: order.quantity,
          unit: order.unit,
          price: order.price,
          expectedDelivery: order.expectedDelivery,
          paymentTerms: order.paymentTerms,
          notes: order.notes,
        }
      : {
          unit: "MT",
          paymentTerms: "Net 30",
        },
  });

  const quantity = watch("quantity") || 0;
  const price = watch("price") || 0;
  const total = quantity * price;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Supplier ID"
          placeholder="Supplier ID"
          error={errors.supplierId?.message}
          {...register("supplierId")}
        />
        <Input
          label="Product ID"
          placeholder="Product ID"
          error={errors.productId?.message}
          {...register("productId")}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Quantity"
          type="number"
          placeholder="100"
          error={errors.quantity?.message}
          {...register("quantity", { valueAsNumber: true })}
        />
        <Select
          label="Unit"
          options={UNIT_OPTIONS}
          error={errors.unit?.message}
          {...register("unit")}
        />
        <Input
          label="Price per Unit"
          type="number"
          placeholder="150.00"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
      </div>

      {/* Total Calculation */}
      <div className="p-4 bg-background rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-text-secondary">Total Amount:</span>
          <span className="text-lg font-bold text-navy">
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expected Delivery"
          type="date"
          {...register("expectedDelivery")}
        />
        <Select
          label="Payment Terms"
          options={PAYMENT_TERMS_OPTIONS}
          error={errors.paymentTerms?.message}
          {...register("paymentTerms")}
        />
      </div>

      <Input
        label="Notes"
        placeholder="Additional notes..."
        {...register("notes")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {order ? "Update Purchase Order" : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
