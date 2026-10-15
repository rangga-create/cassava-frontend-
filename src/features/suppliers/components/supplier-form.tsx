"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supplierSchema, type SupplierInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Supplier } from "@/types";

const COUNTRY_OPTIONS = [
  { value: "Indonesia", label: "Indonesia" },
  { value: "Thailand", label: "Thailand" },
  { value: "Vietnam", label: "Vietnam" },
  { value: "China", label: "China" },
  { value: "India", label: "India" },
  { value: "Philippines", label: "Philippines" },
  { value: "Malaysia", label: "Malaysia" },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "Brazil", label: "Brazil" },
  { value: "Colombia", label: "Colombia" },
  { value: "Other", label: "Other" },
];

const PAYMENT_TERMS_OPTIONS = [
  { value: "Net 30", label: "Net 30" },
  { value: "Net 60", label: "Net 60" },
  { value: "Net 90", label: "Net 90" },
  { value: "COD", label: "Cash on Delivery" },
  { value: "LC", label: "Letter of Credit" },
  { value: "T/T", label: "Telegraphic Transfer" },
];

interface SupplierFormProps {
  supplier?: Supplier;
  onSubmit: (data: SupplierInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function SupplierForm({
  supplier,
  onSubmit,
  onCancel,
  loading = false,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: supplier
      ? {
          companyName: supplier.companyName,
          contactName: supplier.contactName,
          email: supplier.email,
          phone: supplier.phone,
          country: supplier.country,
          province: supplier.province,
          city: supplier.city,
          address: supplier.address,
          products: supplier.products,
          paymentTerms: supplier.paymentTerms,
        }
      : {
          country: "Indonesia",
          paymentTerms: "Net 30",
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company Name"
          placeholder="PT Supplier Jaya"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
        <Input
          label="Contact Name"
          placeholder="Budi Santoso"
          error={errors.contactName?.message}
          {...register("contactName")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="budi@supplier.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+62 812 3456 7890"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Country"
          options={COUNTRY_OPTIONS}
          error={errors.country?.message}
          {...register("country")}
        />
        <Select
          label="Payment Terms"
          options={PAYMENT_TERMS_OPTIONS}
          error={errors.paymentTerms?.message}
          {...register("paymentTerms")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Province"
          placeholder="Jawa Timur"
          {...register("province")}
        />
        <Input label="City" placeholder="Surabaya" {...register("city")} />
      </div>

      <Input
        label="Address"
        placeholder="Jl. Raya No. 123, Surabaya"
        {...register("address")}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {supplier ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}
